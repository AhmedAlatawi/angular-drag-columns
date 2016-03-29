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

angular.module('dragcolumns', ['ng']).run(function () {
    console.log('dragcolumns run');
}).directive('dragcolumns2', function () {

    return {
        restrict: 'A',
        priority: 100,
        scope: {
            order: '=dragcolumns'
        },
        controller: function ($scope) {
            console.log($scope);


            this.composeDragTable = function (cells) {

                var row = null;
                this.elements.tbody.empty();
                this.elements.thead.empty();
                this.elements.tfoot.empty();

                mapElems(cells, function (item) {

                    row = angular.element('<tr></tr>');
                    row.append(angular.element(item).clone());

                    switch (item.parentNode.parentNode.tagName.toUpperCase()) {
                        case 'THEAD':
                        {
                            this.elements.thead.append(row);
                            break;
                        }
                        case 'TFOOT':
                        {
                            this.elements.tfoot.append(row);
                            break;
                        }
                        default :
                        {
                            this.elements.tbody.append(row);
                            break;
                        }
                    }
                }.bind(this));
            };

            var drag = {
                active: false,
                index: null,
                el: null,
                shiftX: null,
                shiftY: null,
                cells: null,
                headers: null
            };

            this.startDragging = function (el, e) {

                var headers = this.elements.source[0].querySelector('thead th');
                var index = indexOfElement(el, headers);
                drag.cells = this.elements.source[0].querySelectorAll('td:nth-child(' + (index + 1) + '), th:nth-child(' + (index + 1) + ')');
                drag.headers = $$columns;

                this.elements.table.addClass('dragcolumns-active');

                this.composeDragTable(drag.cells);

                [].forEach.call(drag.cells, function (item) {
                    angular.element(item).addClass('dragcolumns-cell');
                });

                var $this = angular.element(el);
                var coords = getCoords($this[0]);

                drag.el = $this;
                drag.index = index;
                drag.shiftX = e.pageX - coords.left;
                drag.shiftY = e.pageY - coords.top;

                this.elements.table.css({
                    width: el[0].offsetWidth + 'px',
                    display: ''
                });
            };
            this.stopDragging = function () {

                this.elements.table.removeClass('dragcolumns-active');

                [].forEach.call(drag.cells, function (item) {
                    angular.element(item).removeClass('dragcolumns-cell');
                });
                this.elements.table.css({
                    display: 'none'
                });

                drag.el = null;
            };

            this.move = function (e) {
                this.elements.table.css({
                    top: e.pageY - drag.shiftY + 'px',
                    left: e.pageX - drag.shiftX + 'px'
                });

                var tableBox = this.elements.table[0].getBoundingClientRect();

                var curIdx = indexOfElement(drag.el, drag.headers);

                var headersCoords = [].map.call(drag.headers, function (item) {
                    return item.getBoundingClientRect();
                });

                var maxOverlapIdx = null,
                    maxOverlap = null;

                var curOverlap = null;
                headersCoords.map(function (item, i) {
                    curOverlap = calcOverlap(item, tableBox);
                    if (curOverlap > maxOverlap) {
                        maxOverlap = curOverlap;
                        maxOverlapIdx = i;
                    }
                });

                if (maxOverlapIdx !== curIdx) {
                    this.swap(curIdx, maxOverlapIdx);
                }
            };

            this.swap = function (curIdx, nextIdx) {
                //$scope.order[curIdx] = $scope.order.splice(nextIdx, 1, $scope.order[curIdx])[0];
                //$scope.$apply();
                console.log('swap', curIdx, nextIdx);
            };


        },
        link: function (scope, el, attrs, ctrl) {

            ctrl.addTable(el);
        }
    };
}).directive('dragcolumns', function () {

    return {
        restrict: 'A',
        priority: 100,
        scope: {
            order: '=dragcolumns'
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

                table[0].className = el[0].className;
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

            var $$columns = [];
            this.addDragColumn = function (el) {
                var elem = angular.element(el)[0];
                if ($$columns.indexOf(elem) == -1) {
                    $$columns.push(elem);
                }
            };
            this.removeDragColumn = function (el) {
                var elem = angular.element(el)[0];
                var idx = $$columns.indexOf(elem);
                if (idx === -1) return $$columns;

                $$columns.splice(idx, 1);
                return $$columns;
            };

            // Dragging

            var $$drag = {
                el: null,
                shiftX: null,
                shiftY: null,
                cells: null
            };

            this.isDragging = function () {
                return !!$$drag.el;
            };
            this.startDragging = function (column, e) {

                var columnIndex = indexOfElement(column, column.parent().children());
                var columnCells = $$elements.source[0].querySelectorAll('td:nth-child(' + (columnIndex + 1) + '), th:nth-child(' + (columnIndex + 1) + ')');

                $$elements.table.addClass('dragcolumns-active');
                this.composeDragTable(columnCells);

                var $this = angular.element(column);
                var coords = getCoords($this[0]);

                $$drag.el = $this;
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

                $$drag.el = null;
            };
            this.move = function (e) {

                console.log(console.log('move'));
                $$elements.table.css({
                    top: e.pageY - $$drag.shiftY + 'px',
                    left: e.pageX - $$drag.shiftX + 'px'
                });

                var tableBox = $$elements.table[0].getBoundingClientRect();

                var curIdx = indexOfElement($$drag.el, $$columns);

                var headersCoords = [].map.call($$columns, function (item) {
                    return item.getBoundingClientRect();
                });

                var maxOverlapIdx = null,
                    maxOverlap = null;

                var curOverlap = null;
                headersCoords.map(function (item, i) {
                    curOverlap = calcOverlap(item, tableBox);
                    if (curOverlap > maxOverlap) {
                        maxOverlap = curOverlap;
                        maxOverlapIdx = i;
                    }
                });

                if (maxOverlapIdx !== curIdx) {
                    this.swap(curIdx, maxOverlapIdx);
                }
            };
            this.swap = function (curIdx, nextIdx) {
                $scope.order[curIdx] = $scope.order.splice(nextIdx, 1, $scope.order[curIdx])[0];
                $scope.$apply();
            }
        },
        link: function (scope, el, attrs, ctrl) {
            ctrl.addTable(el);
        }
    };
}).directive('dragcolumnsItem', function () {

    var isTouchDevice = 'ontouchstart' in window;
    var $$events = {
        start: isTouchDevice ? 'touchstart' : 'mousedown',
        move: isTouchDevice ? 'touchmove' : 'mousemove',
        end: isTouchDevice ? 'touchend' : 'mouseup'
    };

    return {
        require: '^dragcolumns',
        scope: {
            item: '=dragcolumnsItem'
        },
        link: function (scope, el, attrs, ctrl) {

            ctrl.addDragColumn(el, scope);

            scope.$on('$destroy', function () {
                ctrl.removeDragColumn(el);
            });

            var documentEl = angular.element(document);

            function handleMouseMove(e) {
                if (!ctrl.isDragging()) return;
                e.preventDefault();
                ctrl.move(e);
            }

            el.bind($$events.start, function (e) {

                e.preventDefault();
                ctrl.startDragging(el, e);

                ctrl.move(e);

                documentEl.bind($$events.move, handleMouseMove);
                documentEl.bind($$events.end, function (e) {

                    ctrl.stopDragging();
                    documentEl.unbind($$events.end);
                    documentEl.unbind($$events.move, handleMouseMove);
                });

            });

        }
    }
});