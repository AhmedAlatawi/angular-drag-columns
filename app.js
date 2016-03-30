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
            "attorney_training",
            "car_mileage",
            "date",
            "dues_subscriptions",
            "educational_supplies",
            "electricity",
            "equipment",
            "freight_delivery_charges",
            "hire_of_passenger_cars",
            "miscellaneous_current_expenses",
            "office_supplies",
            "other_curr_exp",
            "other_services_on_fee_basis",
            "other_utilities",
            "payroll",
            "postage",
            "r_m_machinery_equip",
            "rental_of_equipment",
            "rental_of_land_building",
            "subsistnce_allowance_intrastate",
            "telephone_telegraph_1",
            "totals",
            "transportation_intrastate"
        ],
        data: []
    };
    $scope.onReorder = function (curIdx, newIdx) {
        //console.log('swap', curIdx, newIdx);
    }
});
