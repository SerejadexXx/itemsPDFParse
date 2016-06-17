var module = angular.module('indexApp');

module.config(function($stateProvider) {
    $stateProvider
        .state('home', {
            url: '/home?accessCode',
            templateUrl: 'home/home.html',
            controller: 'homeCtrl'
        })
})
    .controller('homeCtrl', function(
        $scope,
        $http,
        $rootScope,
        $stateParams,
        $window,
        $timeout,
        dataModelFunctional
    ) {
        $scope.imageTimes = 0;
        $rootScope.pictureTimesUpdated = 0;
        $rootScope.$watch('pictureTimesUpdated', function() {
            $scope.imageTimes = dataModelFunctional.GetPictureTimes();
        });

        if ($stateParams.accessCode && $stateParams.accessCode.length > 0) {
            $window.localStorage.accessCode = $stateParams.accessCode;
        }
        $scope.accessCode = $window.localStorage.accessCode;

        // 0 - loading
        // 1 - success
        // 2 - error
        $scope.dataLoaded = 0;

        dataModelFunctional.FetchData().then(
            function() {
                $scope.dataLoaded = 1;
                $scope.displayImageNumber = dataModelFunctional.Images.GetCursor();
                $scope.imageList = dataModelFunctional.Images.GetList()
            },
            function() {

            }
        );

        $scope.NextImage = function() {
            if ($scope.displayImageNumber + 1 < $scope.imageList.length) {
                $scope.displayImageNumber++;
            }
            dataModelFunctional.SetCursor($scope.displayImageNumber);
        };
        $scope.PrevImage = function() {
            if ($scope.displayImageNumber - 1 >= 0) {
                $scope.displayImageNumber--;
            }
            dataModelFunctional.SetCursor($scope.displayImageNumber);
        };

        $scope.UpdateToServer = function() {
            if (confirm("Отправить данные?")) {
                $scope.dataLoaded = 0;
                dataModelFunctional.UpdateByLast().then(
                    function() {
                        $scope.dataLoaded = 1;
                    },
                    function() {
                        $scope.dataLoaded = 2;
                    }
                );
            }
        };

        $scope.displayImageNumber = -1;
        $scope.imageList = [];


        $scope.item = {
            code: ""
        };
        $scope.task = {
            type: 0,
            desc: ''
        };
        $scope.answer = {
            text: '',
            color: '#000000',
            colorCode: '',
            colorDesc: ''
        };

        $scope.NewCode = function() {
            dataModelFunctional.Code.New($scope.item.code);
            $scope.NextTask();
        };

        $scope.NextTask = function() {
            if (!dataModelFunctional.Code.Exists($scope.item.code)) {
                $scope.task.type = 1;
                $scope.task.desc = 'Код "' + $scope.item.code + '" не найден';
                $scope.task.code = $scope.item.code;
                return;
            }
            var TaskName = dataModelFunctional.Tasks.Get($scope.item.code);
            if (TaskName) {
                $scope.task.type = 2;
                $scope.task.desc = 'Ввведите поле "' + TaskName.disp + '"';
                $scope.task.code = $scope.item.code;
                $scope.task.taskName = TaskName;
                $scope.answer.text = '';
                return;
            }

            var ColorTask = dataModelFunctional.Tasks.ColorTask($scope.item.code);
            if (ColorTask) {
                $scope.task.type = 3;
                $scope.task.desc = 'Найдите картинку, что соответсвует коду: '
                    + ColorTask.colorDesc + '['
                    + ColorTask.colorCode + ']';
                $scope.task.code = $scope.item.code;
                $scope.task.colorCode = ColorTask.colorCode;
                $scope.answer.color = dataModelFunctional.GetRGBForColorCode(ColorTask.colorCode);
                return;
            }

            $scope.task.type = 4;
            $scope.task.desc = 'Добавьте нехватающего кода, если есть';
        };


        $scope.Answer = function(type) {
            if ($scope.task.type == 2) {
                dataModelFunctional.Tasks.Solve($scope.task.taskName, $scope.task.code, $scope.answer.text);
                $scope.dataLoaded = 2;
            }

            if ($scope.task.type == 3) {
                dataModelFunctional.Tasks.SolveColorTask(
                    $scope.task.code,
                    $scope.task.colorCode,
                    {
                        type: type,
                        val: type == 0 ?
                            $rootScope.currentUrl :
                            $scope.answer.color
                    }
                );
                if (type == 0) {
                    $scope.NextImage();
                }
                $scope.dataLoaded = 2;
            }

            if ($scope.task.type == 4) {
                if ($scope.answer.colorCode.length == 0 || $scope.answer.colorDesc.length == 0) {
                    return;
                }

                dataModelFunctional.AddedColors.Add(
                    $scope.item.code,
                    $scope.answer.colorCode,
                    $scope.answer.colorDesc,
                    {
                        type: type,
                        val: type == 0 ?
                            $rootScope.currentUrl :
                            $scope.answer.color
                    }
                );
                if (type == 0) {
                    $scope.NextImage();
                }
                $scope.answer.colorCode = "";
                $scope.answer.colorDesc = "";
                $scope.dataLoaded = 2;
            }

            $scope.task.type = 0;
            $scope.NextTask();
        };

        $scope.infoEnabled = false;
        $scope.info = {
            code: '',
            obj: {},
            remove: function(what, code) {
                if (what == 'img') {
                    $scope.info.obj.imgs = $scope.info.obj.imgs.filter(function(img) {
                        return img.colorCode != code;
                    });
                } else {
                    $scope.info.obj.props = $scope.info.obj.props.filter(function(prop) {
                        return prop.name.val != code;
                    });
                }
                $scope.dataLoaded = 2;
            },
            updateNotes: function() {
                dataModelFunctional.Notes.Set($scope.info.code, $scope.info.obj.notes);
                $scope.dataLoaded = 2;
            }
        };
        $scope.GetInfo = function() {
            if (!dataModelFunctional.Code.Exists($scope.item.code)) {
                $scope.task.type = 1;
                $scope.task.desc = 'Код "' + $scope.item.code + '" не найден';
                $scope.task.code = $scope.item.code;
                return;
            }
            $scope.info.code = $scope.item.code;
            $scope.info.obj = dataModelFunctional.Info.Get($scope.info.code);
            $scope.infoEnabled = true;
        };
        $scope.CloseInfo = function() {
            dataModelFunctional.UpdatePictureTimes();
            $scope.infoEnabled = false;
        };

        $scope.jsonShowEnabled = false;
        $scope.jsonString = "";
        $scope.ShowJSON = function() {
            $scope.jsonShowEnabled = true;
            $scope.jsonString = dataModelFunctional.GetJSON();
        };
        $scope.CloseJSON = function() {
            $scope.jsonShowEnabled = false;
        };
    });