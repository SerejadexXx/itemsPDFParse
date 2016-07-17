var module = angular.module('collectionsModel', []);

module.service('collectionsModelFunctional', function($window, $http, $q, $timeout, $rootScope) {
    var info = {};
    var accessCodes = [];
    var filters = [];
    var cardDisplayList = [];
    var xlsDisplayList = [];
    var collectionData = [];
    var fieldsAvailable = [];
    var Server = {
        loadingComplete: true,
        FetchData: function() {
            var deferred = $q.defer();
            $http.get('/collections/get', {
                params: {
                    collectionCode: $window.localStorage.collectionCode
                }
            }).then(
                function(res) {
                    var data = JSON.parse(res.data);

                    if (data.info) {
                        info = data.info;
                    } else {
                        info = {
                            name: "",
                            password: ""
                        };
                    }

                    if (data.accessCodes) {
                        accessCodes = data.accessCodes;
                    } else {
                        accessCodes = [];
                    }

                    if (data.filters) {
                        filters = data.filters;
                    } else {
                        filters = [];
                    }

                    if (data.cardDisplayList) {
                        cardDisplayList = data.cardDisplayList;
                    } else {
                        cardDisplayList = [];
                    }

                    if (data.xlsDisplayList) {
                        xlsDisplayList = data.xlsDisplayList;
                    } else {
                        xlsDisplayList = [];
                    }

                    deferred.resolve();
                },
                function(err) {
                    console.log(err);
                    deferred.reject();
                }
            );
            return deferred.promise;
        },
        UpdateByLast: function() {
            var defer = $q.defer();

            var UpdateByLast = function() {
                if (Server.loadingComplete) {
                    Server.loadingComplete = false;
                    $http.post('/collections/new', {
                        collectionCode: $window.localStorage.collectionCode,
                        data: {
                            info: info,
                            accessCodes: accessCodes,
                            filters: filters,
                            cardDisplayList: cardDisplayList,
                            xlsDisplayList: xlsDisplayList
                        }
                    }).then(
                        function() {
                            Server.loadingComplete = true;
                            defer.resolve({});
                        },
                        function(err) {
                            Server.loadingComplete = true;
                            defer.reject({});
                        }
                    );
                } else {
                    $timeout(
                        UpdateByLast,
                        100
                    );
                }
            };

            UpdateByLast();
            return defer.promise;
        },
        FetchCollectionData: function() {
            var defer = $q.defer();

            var UpdateByLast = function() {
                if (Server.loadingComplete) {
                    Server.loadingComplete = false;
                    $http.get('/data/collection', {
                        params: {
                            accessCodes: accessCodes.map(function(code) {
                                return code.val;
                            })
                        }
                    }).then(
                        function(res) {
                            Server.loadingComplete = true;
                            var data = JSON.parse(res.data);
                            if (!data) {
                                collectionData = [];
                            } else {
                                collectionData = data;
                            }
                            fieldsAvailable = [];
                            collectionData.forEach(function(object) {
                                object.data.taskNamesList.forEach(function(taskName) {
                                    var val = taskName.val;
                                    if (fieldsAvailable.indexOf(val) < 0) {
                                        fieldsAvailable.push(val);
                                    }
                                });
                                object.data.values.forEach(function(item) {
                                    Object.keys(item).forEach(function(val) {
                                        if (fieldsAvailable.indexOf(val) < 0) {
                                            fieldsAvailable.push(val);
                                        }
                                    });
                                });
                            });
                            defer.resolve({});
                        },
                        function(err) {
                            Server.loadingComplete = true;
                            defer.reject({});
                        }
                    );
                } else {
                    $timeout(
                        UpdateByLast,
                        100
                    );
                }
            };

            UpdateByLast();
            return defer.promise;
        }
    };

    this.FetchData = function() {
        return Server.FetchData();
    };
    this.UpdateByLast = function() {
        return Server.UpdateByLast();
    };
    this.FetchCollectionData = function() {
        return Server.FetchCollectionData();
    };

    this.Info = function() {
        return info;
    };

    this.GetAccessCodes = function() {
        return accessCodes;
    };

    this.GetFieldsAvailable = function() {
        return fieldsAvailable;
    };

    this.GetFilters = function() {
        return filters;
    };

    this.GetCardDisplayList = function() {
        return cardDisplayList;
    };

    this.GetXLSDisplayList = function () {
        return xlsDisplayList;
    };
});