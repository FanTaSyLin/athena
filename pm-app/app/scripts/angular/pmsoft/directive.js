/**
 * Created by FanTaSyLin on 2017/1/5.
 */
(function () {

    "use strict";

    angular.module("PMSoft")
        .directive("onFinishRenderFilters", function ($timeout) {
            return {
                restrict: 'A',
                link: function(scope, element, attr) {
                    if (scope.$last === true) {
                        $timeout(function() {
                            scope.$emit('ngRepeatFinished');
                        });
                    }
                }
            };

        });

})();