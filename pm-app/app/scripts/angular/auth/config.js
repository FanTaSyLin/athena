/**
 * Created by FanTaSyLin on 2016/8/7.
 */

(function () {

    'use strict';

    angular.module('Auth')
        .config(configFunc);

    configFunc.$inject = ['$routeProvider', '$httpProvider'];

    function configFunc($routeProvider, $httpProvider) {
        $routeProvider.when('/login', {
            templateUrl: 'partials/login.html',
            controller: 'LoginController'
        });

        $routeProvider.when('/signin', {
            templateUrl: 'partials/signin.html',
            controller: 'SignInController'
        });

        $routeProvider.when('/forgot', {
            templateUrl: 'partials/forgot.html',
            controller: ''
        });

        $routeProvider.otherwise({
            redirectTo: '/login'
        });

        $httpProvider.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';

        //$httpProvider.defaults.headers.common = {};
        //$httpProvider.defaults.headers.post = {};
        //$httpProvider.defaults.headers.put = {};
        //$httpProvider.defaults.headers.patch = {};

        delete $httpProvider.defaults.headers.common['X-Requested-With'];

        /*
        $httpProvider.interceptors.push(['$q', '$location', '$cookies', function ($q, $location, $cookies) {
            return {
                'request': function (config) {
                    config.headers = config.headers || {};

                    var token = $cookies.get('token');

                    var username = $cookies.get('username');

                    if (token) {
                        config.headers.Authorization = 'Bearer ' + token;
                    }

                    return config;
                },
                'responseError': function (response) {
                    if (response.status === 401 || response.status === 403) {
                        $location.path('/login');
                    }
                    return $q.reject(response);
                }
            };
        }]);

        */
    }
})();

/*
var app = angular.module('Auth', [
    'ngRoute',
    'ngCookies'
]);

app.config(['$routeProvider', '$httpProvider', '$locationProvider', function ($routeProvider, $httpProvider, $locationProvider) {

    $routeProvider.when('/login', {
        templateUrl: 'partials/login.html',
        controller: 'LoginCtrl'
    });

    $routeProvider.when('/signin', {
        templateUrl: 'partials/signin.html',
        controller: 'LoginCtrl'
    });

    $routeProvider.when('/forgot', {
        templateUrl: 'partials/forgot.html',
        controller: 'LoginCtrl'
    });

    $routeProvider.otherwise({
        redirectTo: '/login'
    });

    $httpProvider.defaults.headers.common = {};
    $httpProvider.defaults.headers.post = {};
    $httpProvider.defaults.headers.put = {};
    $httpProvider.defaults.headers.patch = {};

    delete $httpProvider.defaults.headers.common['X-Requested-With'];

    //$locationProvider.html5Mode(true);

    $httpProvider.interceptors.push(['$q', '$location', '$cookies', function ($q, $location, $cookies) {
        return {
            'request': function (config) {
                config.headers = config.headers || {};

                var token = $cookies.get('token');

                var username = $cookies.get('username');

                if (token) {
                    config.headers.Authorization = 'Bearer ' + token;
                }

                return config;
            },
            'responseError': function (response) {
                if (response.status === 401 || response.status === 403) {
                    $location.path('/login');
                }
                return $q.reject(response);
            }
        };
    }]);

}]);

*/