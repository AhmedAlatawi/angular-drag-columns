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

angular.module('dragcolumns', ['ng']).run(function () {
    console.log('dragcolumns run');
}).directive('dragcolumns', function () {

    return {
        restrict: 'A',
        priority: 100,
        controller: function () {
            var elems = [];
            this.addElem = function (el) {
                if (elems.indexOf(el) !== -1) return elems;
                elems.push(angular.element(el)[0]);
                return elems;
            };
            this.getElems = function () {
                return elems;
            };
            this.removeElem = function (el) {
                var idx = elems.indexOf(el);
                if (idx === -1) return elems;
                elems = elems.splice(idx, 1);
                return elems;
            };

            var dragElement = null;
            this.setDragElement = function (el) {
                dragElement = el;
            };
            this.getDragElement = function () {
                return dragElement;
            };

        },
        link: function (scope, el, attrs, ctrl) {

        }
    };
}).directive('dragcolumnsItem', function () {
    return {
        require: '^dragcolumns',
        link: function (scope, el, attrs, ctrl) {
            var originalDraggable = attrs.draggable;
            el.attr('draggable', true);
            console.log('link', el);
            ctrl.addElem(el);

            el.bind('dragstart', function (e) {
                //this.style.opacity = .4;
                ctrl.setDragElement(this);
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', this.innerHTML);
            });
            el.bind('dragenter', function (e) {
                angular.element(this).addClass('dragcolumns-item-active');
            });
            el.bind('dragleave', function (e) {
                angular.element(this).removeClass('dragcolumns-item-active');
            });
            el.bind('dragover', function (e) {
                if (e.preventDefault) {
                    e.preventDefault(); // Necessary. Allows us to drop.
                }

                e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.

                return false;
            });


            el.bind('dragend', function (e) {
                console.log('dragend)', ctrl.getElems());
                angular.element(ctrl.getElems()).removeClass('dragcolumns-item-active');
            });

            el.bind('drop', function (e) {
                if (e.stopPropagation) {
                    e.stopPropagation(); // stops the browser from redirecting.
                }
                //el[0].innerHTML = this.innerHTML;
                ctrl.getDragElement().innerHTML = this.innerHTML;
                this.innerHTML = e.dataTransfer.getData('text/html');
                //console.log(this, e.dataTransfer.getData('text/html'));
                return false;
            });

            scope.$on('$destroy', function () {
                console.log('destroy');
                el.attr('draggable', originalDraggable);
            })
        }
    }
});