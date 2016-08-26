/**
 * Created by FanTaSyLin on 2016/8/6.
 */

(function () {
    angular.module('Auth')
        .controller('AuthController', AuthController);

    AuthController.$inject = ['$cookies', 'AuthService'];

    function AuthController($cookies, AuthService) {
        var self = this;

        self.credentials = {
            username: '',
            password: ''
        };

        self.auth = {
            username: '',
            password: '',
            password2: ''
        };

        self.login = login;
        self.signIn = signIn;

        function signIn(auth) {

            if (auth.password !== auth.password2) {
                //TODO: 提醒
            } else {
                AuthService.signIn(auth, function (data, status, headers, config) {

                }, function (data, status, headers, config) {

                });
            }

        }

        function login(credentials) {
            AuthService.login(credentials, function (data, status, headers, config) {

                $cookies.put('username', data.username);
                $cookies.put('token', data.token);


                window.location.href = 'http://localhost:4002/pm-soft';



            }, function (data, status, headers, config) {
                alert('err');
            })
        }
    }

})();


/*
var app = angular.module('Auth');

app.controller('LoginCtrl', ['$cookies', '$scope', 'AuthService', function ($cookies, $scope, AuthService) {

    $scope.credentials = {
        username: '',
        password: ''
    };

    $scope.login = function (credentials) {

        AuthService.login(credentials, function (data, status, headers, config) {

            $cookies.put('username', data.username);
            $cookies.put('token', data.token);


            window.location.href = 'http://localhost:4002/pm-soft';



        }, function (data, status, headers, config) {
            alert('err');
        })
    }

}]);
*/
