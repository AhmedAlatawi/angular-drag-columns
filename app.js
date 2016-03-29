'use strict';

angular.module('app', [
    'dragcolumns'
]);

angular.module('app').controller('AppController', function ($scope) {

    $scope.table = {
        headers: [
            'name',
            'age',
            'income',
            'city'
        ],
        data: [
            {
                name: 'John',
                age: 20,
                income: 20000,
                city: 'NYC'
            },
            {
                name: 'Jessika',
                age: 21,
                income: 15000,
                city: 'Florida'
            },
            {
                name: 'Steve',
                age: '20',
                income: 12000,
                city: 'LA'
            }
        ]
    };
    $scope.onReorder = function (curIdx, newIdx) {
        //console.log('swap', curIdx, newIdx);
    }
});
