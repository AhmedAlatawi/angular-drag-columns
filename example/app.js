'use strict';

angular.module('app', [
    'dragcolumns'
]);

angular.module('app').controller('AppController', function ($scope, $http) {

    $http.get('https://dashboard.hawaii.gov/resource/iytq-na8a.json').then(function (resp) {
        $scope.table.data = resp.data;
    });
    $scope.table = {
        headers: [
            {"key": "attorney_training"},
            {"key": "car_mileage"},
            {"key": "date"},
            {"key": "dues_subscriptions"},
            {"key": "educational_supplies"},
            {"key": "electricity"},
            {"key": "equipment"},
            {"key": "freight_delivery_charges"},
            {"key": "hire_of_passenger_cars"},
            {"key": "miscellaneous_current_expenses"},
            {"key": "office_supplies"},
            {"key": "other_curr_exp"},
            {"key": "other_services_on_fee_basis"},
            {"key": "other_utilities"},
            {"key": "payroll"},
            {"key": "postage"},
            {"key": "r_m_machinery_equip"},
            {"key": "rental_of_equipment"},
            {"key": "rental_of_land_building"},
            {"key": "subsistnce_allowance_intrastate"},
            {"key": "telephone_telegraph_1"},
            {"key": "totals"},
            {"key": "transportation_intrastate"}
        ],
        data: []
    };

    $scope.onClick = function (header) {
        alert('click on header, ' + header.key);
    }
    $scope.onReorder = function (curIdx, newIdx) {
        //console.log('swap', curIdx, newIdx);
    }
});
