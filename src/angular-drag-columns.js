'use strict';

function indexOfElement(elem, setElms) {

    var $elem = angular.element(elem),
        i = 0, l = setElms.length;

    for (i = 0; i < l; i++) {
        if ($elem[0].isEqualNode(setElms[i])) break;
    }

    return i;
}
function mapElems(elems, cb) {
    var result = [];
    angular.forEach(elems, function (item) {
        result.push(item);
    });
    return result.map(cb);
}
function getCoords(elem) {
    // (1)
    var box = elem.getBoundingClientRect();

    var body = document.body;
    var docEl = document.documentElement;

    // (2)
    var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    // (3)
    var clientTop = docEl.clientTop || body.clientTop || 0;
    var clientLeft = docEl.clientLeft || body.clientLeft || 0;

    // (4)
    var top = box.top + scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;

    return {
        top: top,
        left: left
    };
}
function calcOverlap(blockA, blockB) {
    var minWidth = Math.min(blockA.width, blockB.width);

    var leftBlock = blockA.left < blockB.left ? blockA : blockB;
    var rightBlock = blockA == leftBlock ? blockB : blockA;

    var maxCommonLeft = rightBlock.left;
    var minCommonRight = Math.min(leftBlock.right, rightBlock.right);

    return (minCommonRight - maxCommonLeft) / minWidth;
}

function calcDropKoef(dropPlace, handler) {

    var dropPlaceBlock = {
        left: dropPlace.left,
        right: dropPlace.right,
        bottom: dropPlace.bottom,
        top: dropPlace.top,
        width: dropPlace.width,
        height: dropPlace.height
    };

    if (dropPlace.width > handler.width) {
        dropPlaceBlock.width = handler.width;

        /**
         * A = handler
         * B = dropPlace - block in which place we want to move handler
         * C = dropPlaceBlock - area in drop place, where handler will be located, when block will be replaced
         * /-------------------------------
         * |  C  |                  |  A  |
         * |-------------------------------
         * |             B          |
         */
        if (dropPlace.left < handler.left) {
            dropPlaceBlock.right = dropPlaceBlock.left + dropPlaceBlock.width;
        } else {
            dropPlaceBlock.left = dropPlaceBlock.right - dropPlaceBlock.width;
        }
    }
    return calcOverlap(dropPlaceBlock, handler);
}

angular.module('dragcolumns', []).directive('dragcolumns', function () {

    return {
        restrict: 'A',
        priority: 100,
        scope: {
            order: '=dragcolumns',
            callback: '&dragcolumnsCallback'
        },
        controller: function ($scope) {

            var $$elements = {
                table: null,
                thead: null,
                tfoot: null,
                tbody: null,
                source: null
            };

            this.addTable = function (el) {
                var table = angular.element('<table></table>');

                table.addClass(el[0].className);
                table.addClass('dragcolumns-table');

                table.css({
                    display: 'none'
                });

                var tableBody = angular.element('<tbody></tbody>');
                var tableHead = angular.element('<thead></thead>');
                var tableFoot = angular.element('<tfoot></tfoot>');

                table.append(tableBody);
                table.append(tableHead);
                table.append(tableFoot);

                angular.element(document.body).append(table);

                $$elements.table = table;
                $$elements.tbody = tableBody;
                $$elements.thead = tableHead;
                $$elements.tfoot = tableFoot;

                $$elements.source = el;
            };

            this.composeDragTable = function (cells) {

                var row = null;
                $$elements.tbody.empty();
                $$elements.thead.empty();
                $$elements.tfoot.empty();

                mapElems(cells, function (item) {

                    row = angular.element('<tr></tr>');
                    row.append(angular.element(item).clone());

                    switch (item.parentNode.parentNode.tagName.toUpperCase()) {
                        case 'THEAD':
                        {
                            $$elements.thead.append(row);
                            break;
                        }
                        case 'TFOOT':
                        {
                            $$elements.tfoot.append(row);
                            break;
                        }
                        default :
                        {
                            $$elements.tbody.append(row);
                            break;
                        }
                    }
                }.bind(this));
            };

            var $$columns = {};
            this.addDragColumn = function (key, el, item) {
                var elem = angular.element(el)[0];
                if ($$columns[key]) {
                    throw new Error('key ' + key + ' is already used');
                }
                $$columns[key] = {
                    el: elem,
                    item: item
                };
            };
            this.removeDragColumn = function (key) {
                delete $$columns[key];
                return $$columns;
            };

            // Dragging

            var $$drag = {
                key: null,
                shiftX: null,
                shiftY: null,
                cells: null
            };

            this.isDragging = function () {
                return !!$$drag.key;
            };
            this.startDragging = function (key, e) {

                var column = angular.element($$columns[key].el);
                var columnIndex = indexOfElement(column, column.parent().children());
                var columnCells = $$elements.source[0].querySelectorAll('td:nth-child(' + (columnIndex + 1) + '), th:nth-child(' + (columnIndex + 1) + ')');

                $$elements.table.addClass('dragcolumns-active');
                this.composeDragTable(columnCells);

                var $this = angular.element(column);
                var coords = getCoords($this[0]);

                $$drag.key = key;
                $$drag.shiftX = e.pageX - coords.left;
                $$drag.shiftY = e.pageY - coords.top;
                $$drag.cells = angular.element(columnCells).addClass('dragcolumns-cell');

                $$elements.table.css({
                    width: $this[0].offsetWidth + 'px',
                    display: ''
                });

            };
            this.stopDragging = function () {

                $$drag.cells.removeClass('dragcolumns-cell');
                $$elements.table.removeClass('dragcolumns-active');
                $$elements.table.css({
                    display: 'none'
                });

                $scope.$emit('dragcolumnsStopDragging');

                $$drag.key = null;
            };

            this.move = function (e) {

                $$elements.table.css({
                    top: e.pageY - $$drag.shiftY + 'px',
                    left: e.pageX - $$drag.shiftX + 'px'
                });

                var tableBox = $$elements.table[0].getBoundingClientRect();

                var headersCoords = Object.keys($$columns).map(function (item) {
                    return {
                        key: item,
                        coords: $$columns[item].el.getBoundingClientRect()
                    }
                });

                var maxOverlapKey = null,
                    maxOverlap = null;

                var curOverlap = null;
                headersCoords.forEach(function (item) {
                    curOverlap = calcDropKoef(item.coords, tableBox);
                    if (curOverlap > maxOverlap) {
                        maxOverlap = curOverlap;
                        maxOverlapKey = item.key;
                    }
                });

                if (maxOverlap > 0 && maxOverlapKey !== $$drag.key) {
                    this.swap($$drag.key, maxOverlapKey);
                }
            };

            this.swap = function (curKey, nextKey) {

                var callback = $scope.callback();
                var curIdx = $scope.order.indexOf($$columns[curKey].item),
                    nextIdx = $scope.order.indexOf($$columns[nextKey].item);

                if (typeof callback === 'function') {
                    callback(curIdx, nextIdx);
                }

                $scope.order[curIdx] = $scope.order.splice(nextIdx, 1, $scope.order[curIdx])[0];
                $scope.$apply();
            };

            this.destroy = function () {
                $$elements.table.remove();
            }
        },
        link: function (scope, el, attrs, ctrl) {
            ctrl.addTable(el);
            scope.$on('$destroy', function () {
                ctrl.destroy();
            });
        }
    };
}).directive('dragcolumnsItem', function ($log) {

    var isTouchDevice = 'ontouchstart' in window;
    var $$events = {
        start: isTouchDevice ? 'touchstart' : 'mousedown',
        move: isTouchDevice ? 'touchmove' : 'mousemove',
        end: isTouchDevice ? 'touchend' : 'mouseup'
    };

    return {
        require: ['^dragcolumns'],
        scope: {
            item: '=dragcolumnsItem',
            key: '=dragcolumnsItemKey'
        },
        link: function (scope, el, attrs, ctrls) {

            var key = scope.key;
            if (!key && typeof scope.item === 'string') {
                key = scope.item;
            }

            if (!key) {
                throw new Error('dragcolumnsItem key is required. add dragcolumns-item="item.key"');
            }

            var dragCtrl = ctrls[0];
            dragCtrl.addDragColumn(key, el, scope.item);

            scope.$on('$destroy', function () {
                dragCtrl.removeDragColumn(key);
            });

            var documentEl = angular.element(document);

            var handleMouseMove = function (e) {
                if (!dragCtrl.isDragging()) return;
                e.preventDefault();
                dragCtrl.move(e.touches ? e.touches[0] : e);
            };

            function clearSelection() {
                if (window.getSelection) {
                    if (window.getSelection().empty) {  // Chrome
                        window.getSelection().empty();
                    } else if (window.getSelection().removeAllRanges) {  // Firefox
                        window.getSelection().removeAllRanges();
                    } else if (window.getSelection().collapseToStart) {
                        window.getSelection().collapseToStart();
                    }
                } else if (document.selection) {  // IE?
                    if (document.selection.empty) {
                        document.selection.empty();
                    } else if (document.selection.createRange) {
                        var range = document.selection.createRange();
                        range.expand("word");
                        range.execCommand("unselect");
                    }
                }
            }

            function onStartDrag(e) {
                e.cancelBubble = true;

                e.preventDefault();
                e.stopPropagation();

                clearSelection();

                dragCtrl.startDragging(key, e.touches ? e.touches[0] : e);

                dragCtrl.move(e.touches ? e.touches[0] : e);

                clearSelection();

                documentEl.bind($$events.move, handleMouseMove);
                documentEl.bind($$events.end, function (e) {

                    dragCtrl.stopDragging();
                    clearSelection();

                    documentEl.unbind($$events.end);
                    documentEl.unbind($$events.move, handleMouseMove);
                });
            }

            var HOLD_DURATION = 500,
                timeoutId = null;
            el.bind($$events.start, function (e) {
                timeoutId = setTimeout(function () {
                    onStartDrag(e);
                }, HOLD_DURATION);
            }).bind($$events.end, function (e) {
                clearTimeout(timeoutId);
            });

        }
    }
});
