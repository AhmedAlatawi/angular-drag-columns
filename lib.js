'use strict';

angular.module('app', []);

angular.module('app').controller('AppController', function ($scope) {

    $scope.order = [];
});

angular.module('app').directive('dragColumns', function () {
    return {
        restrict: 'A',
        link: function (scope, el, attrs) {
            var ths = angular.element(el[0].querySelectorAll('thead th'));
            ths.bind('dragstart', function () {
                console.log('start dragging', this);
            });

        }
    };
});