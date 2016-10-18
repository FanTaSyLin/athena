/**
 * Created by FanTaSyLin on 2016/8/6.
 */

(function () {
    angular.module('Auth')
        .controller('LoginController', LoginController)
        .controller('SignInController', SignInController);

    LoginController.$inject = ['$cookies', 'AuthService'];
    SignInController.$inject = ['$cookies', 'AuthService'];

    function SignInController($cookies, AuthService) {
        var self = this;
        self.auth = {
            username: '',
            password: '',
            password2: ''
        };

        self.signIn = signIn;

        function signIn(auth) {

            if (auth.password !== auth.password2) {
                //TODO: 提醒
            } else {
                AuthService.signIn(auth, function (data, status, headers, config) {
                    AuthService.login({
                        username: self.auth.username,
                        password: self.auth.password
                    }, function (data, status, headers, config) {
                        var expireTime = new Date();
                        expireTime.setDate(expireTime.getDate() + 7);
                        $cookies.put('account', data.username, {'expires': expireTime});
                        $cookies.put('token', data.token, {'expires': expireTime});
                        window.location.href = 'http://localhost:4002/signin?username=' + data.username;

                    }, function (data, status, headers, config) {
                        alert('err');
                    });

                }, function (data, status, headers, config) {
                    alert(status);
                });
            }

        }
    }

    function LoginController($cookies, AuthService) {
        var self = this;

        self.credentials = {
            username: '',
            password: ''
        };

        self.login = login;

        function login(credentials) {
            AuthService.login(credentials, function (data, status, headers, config) {
                var expireTime = new Date();
                expireTime.setDate(expireTime.getDate() + 7);
                $cookies.put('account', data.username, {'expires': expireTime});
                $cookies.put('token', data.token, {'expires': expireTime});


                window.location.href = 'pm-soft';


            }, function (data, status, headers, config) {
                alert('err');
            });
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
