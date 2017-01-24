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

        self.signIn = _signIn;
        self.signInByKey = _signInByKey;

        function _signInByKey($event, auth) {
            if ($event.keyCode === 13) {
                _signIn(auth);
            }
        }

        function _signIn(auth) {

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
                        window.location.href = 'signin?username=' + data.username;

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

        self.login = _login;
        self.loginByKey = _loginByKey;

        function _loginByKey($event, credentials) {
            if ($event.keyCode === 13) {
                _login(credentials);
            }
        }

        function _login(credentials) {
            AuthService.login(credentials, function (data, status, headers, config) {
                var expireTime = new Date();
                expireTime.setDate(expireTime.getDate() + 7);
                $cookies.put('account', data.username, {'expires': expireTime});
                $cookies.put('token', data.token, {'expires': expireTime});


                window.location.href = 'pm-soft';


            }, function (data, status, headers, config) {
                alert('用户名与密码不一致');
            });
        }
    }

})();

