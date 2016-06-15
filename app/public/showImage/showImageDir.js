angular.module('indexApp')
    .directive('showImage', function($http, $rootScope) {
        var link = function (scope, element, attrs) {
            var name = "";
            var extToUse = 0;
            var extensions = [
                '.jpg',
                '.png',
                '.tiff',
                ''
            ];
            attrs.$observe('srcName', function(value) {
                var extToUse = 0;
                name = value;
                if (name == "") {
                    return;
                }
                var ok = false;
                var getCorrect = function() {
                    $http.get(name + extensions[extToUse]).then(
                        function () {
                            $rootScope.currentUrl = name + extensions[extToUse];
                            element.children(':first').css({
                                'background-image': "url('" + name + extensions[extToUse] + "')"
                            });
                        },
                        function () {
                            extToUse++;
                            if (extToUse < 4) {
                                getCorrect();
                            }
                        }
                    );
                };
                getCorrect();
            });
        };
        return {
            restrict: 'AE',
            scope: {
              srcName: '@srcName'
            },
            templateUrl: 'showImage/showImage.html',
            link: link
        };
});