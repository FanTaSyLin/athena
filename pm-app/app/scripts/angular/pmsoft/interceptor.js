/**
 * Created by FanTaSyLin on 2016/8/7.
 */


angular.module('PMSoft', [
    'ngStorage',
    'ngCookies'
])
    .factory('Interceptor', ['$q', '$injector', '$cookies', '$localstorage', function ($q, $injector, $cookies, $localStorage) {
        var interceptor = {
            'request': reqInterceptor,
            'response': resInterceptor,
            'requestError': reqErrorInterceptor,
            'responseError': resErrorInterceptor
        };
        
        function reqInterceptor(config) {

            config.headers = config.headers || {};

            var token = $cookies.get('token');

            var username = $cookies.get('username');

            $localStorage.username = username;

            if (token) {
                config.headers.Authorization = 'Bearer ' + token;
            }

            return config;
        }
        
        function resInterceptor() {
            $localStorage.username = 'hahahaha';
            //TODO:
        }
        
        function reqErrorInterceptor() {

            //TODO:
        }
        
        function resErrorInterceptor(res) {

            if (res.status === 401 || res.status === 403) {

            }
            return $q.reject(res);
        }
        
        return interceptor;
    }]);