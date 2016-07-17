var module = angular.module('indexApp');

module.config(function($stateProvider) {
    $stateProvider
        .state('collections', {
            url: '/collections?collectionCode',
            templateUrl: 'collections/collections.html',
            controller: 'collectionsCtrl'
        })
})
    .controller('collectionsCtrl', function(
        $scope,
        $http,
        $stateParams,
        $window,
        collectionsModelFunctional,
        ngDialog
    ) {
        if ($stateParams.collectionCode && $stateParams.collectionCode.length > 0) {
            $window.localStorage.collectionCode = $stateParams.collectionCode;
        }
        $scope.collectionCode = $window.localStorage.collectionCode;

        $scope.dataLoaded = 0;
        collectionsModelFunctional.FetchData().then(
            function() {
                $scope.dataLoaded = 1;
                $scope.info = collectionsModelFunctional.Info();
                $scope.accessCodes = collectionsModelFunctional.GetAccessCodes();
                $scope.filters = collectionsModelFunctional.GetFilters();
                $scope.cardDisplayList = collectionsModelFunctional.GetCardDisplayList();
                $scope.xlsDisplayList = collectionsModelFunctional.GetXLSDisplayList();
                $scope.FetchCollectionData();
            },
            function() {

            });

        $scope.UpdateToServer = function() {
            if (confirm("Отправить данные?")) {
                $scope.dataLoaded = 0;
                collectionsModelFunctional.UpdateByLast().then(
                    function() {
                        $scope.dataLoaded = 1;
                    },
                    function() {
                        $scope.dataLoaded = 2;
                    }
                );
            }
        };

        $scope.DataChanged = function() {
            $scope.dataLoaded = 2;
        };

        $scope.accessCodeToAdd = {
            val: ''
        };
        $scope.AddAccessCode = function() {
            $scope.accessCodes.push({
                val: $scope.accessCodeToAdd.val
            });
            $scope.accessCodeToAdd.val = '';

            $scope.DataChanged();
        };
        $scope.RemoveAccessCode = function(index) {
            $scope.accessCodes.splice(index, 1);

            $scope.DataChanged();
        };
        $scope.FetchCollectionData = function() {
            collectionsModelFunctional.FetchCollectionData().then(function() {
                $scope.fieldsAvailable = collectionsModelFunctional.GetFieldsAvailable();
            });
        };

        $scope.AddFilter = function() {
            $scope.newFilter = {
                type: 'radio',
                item: $scope.fieldsAvailable[0],
                item1: $scope.fieldsAvailable[0],
                item2: $scope.fieldsAvailable[0]
            };
            $scope.SetNewFilterType = function(type) {
                $scope.newFilter.type = type;
            };
            $scope.AddNewFilter = function() {
                $scope.filters.push($scope.newFilter);

                $scope.DataChanged();
            };
            ngDialog.open({
                template: 'collections/filterPicker.html',
                className: 'ngdialog-theme-default',
                scope: $scope,
                width: '80%'
            });
        };
        $scope.RemoveFilter = function(index) {
            $scope.filters.splice(index, 1);
            $scope.DataChanged();
        };

        $scope.AddCardDisplayListItem = function() {
            $scope.newListItem = {
                disp: '',
                item: $scope.fieldsAvailable[0]
            };
            $scope.AddNewDisplayListItem = function() {
                $scope.cardDisplayList.push($scope.newListItem);

                $scope.DataChanged();
            };
            ngDialog.open({
                template: 'collections/itemPicker.html',
                className: 'ngdialog-theme-default',
                scope: $scope,
                width: '80%'
            });
        };

        $scope.RemoveCardDisplayListItem = function(index) {
            $scope.cardDisplayList.splice(index);
            $scope.DataChanged();
        };

        $scope.AddXLSDisplayListItem = function() {
            $scope.newListItem = {
                disp: '',
                item: $scope.fieldsAvailable[0]
            };
            $scope.AddNewDisplayListItem = function() {
                $scope.xlsDisplayList.push($scope.newListItem);

                $scope.DataChanged();
            };
            ngDialog.open({
                template: 'collections/itemPicker.html',
                className: 'ngdialog-theme-default',
                scope: $scope,
                width: '80%'
            });
        };

        $scope.RemoveXLSDisplayListItem = function(index) {
            $scope.xlsDisplayList.splice(index);
            $scope.DataChanged();
        };
    });