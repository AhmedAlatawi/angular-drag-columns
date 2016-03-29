'use strict';

angular.module('app', [
    'dragcolumns'
]);

angular.module('app').controller('AppController', function ($scope) {

    $scope.table = {
        headers: [
            'name',
            'age'
        ],
        data: [
            {
                name: 'John',
                age: 20
            },
            {
                name: 'Jessika',
                age: 21
            },
            {
                name: 'Steve',
                age: '20'
            }
        ]
    };
});
