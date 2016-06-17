var module = angular.module('dataModel', []);

module.service('dataModelFunctional', function($window, $http, $q, $timeout, $rootScope) {
    var times = 0;
    var CalcPictureTimes = function() {
        times = 0;
        items.forEach(function(item) {
            if (item.colorUrl == $rootScope.currentUrl) {
                times++;
            }
        });
        addedColors.forEach(function(item) {
            if (item.colorUrl == $rootScope.currentUrl) {
                times++;
            }
        });
        $rootScope.pictureTimesUpdated++;
    };
    $rootScope.$watch('currentUrl', function() {
        CalcPictureTimes();
    });
    this.UpdatePictureTimes = function() {
        CalcPictureTimes();
    };
    this.GetPictureTimes = function() {
        return times;
    };
    var imagesCount = 0;
    var imageCursor = 0;
    var items = [];
    var notes = [];
    var imageList = [];
    var taskNamesList = [];
    var taskList = [];
    var addedCodes = [];
    var addedColors = [];
    var Server = {
        loadingComplete: true,
        FetchData: function() {
            var deferred = $q.defer();
            $http.get('/data/get', {
                params: {
                    accessCode: $window.localStorage.accessCode
                }
            }).then(
                function(res) {
                    var data = JSON.parse(res.data);
                    imagesCount = Number(data.imgCount);
                    imageCursor = Number(data.imageCursor ? data.imageCursor : 0);

                    if (data.values) {
                        items = data.values;
                    } else {
                        items = [];
                    }
                    if (data.addedCodes) {
                        addedCodes = data.addedCodes;
                    } else {
                        addedCodes = [];
                    }
                    if (data.addedColors) {
                        addedColors = data.addedColors;
                    } else {
                        addedColors = [];
                    }

                    if (data.taskNamesList) {
                        taskNamesList = data.taskNamesList;
                    } else {
                        taskNamesList = [
                        ];
                    }
                    taskList = [];
                    taskNamesList.forEach(function(task) {
                        taskList.push({
                            name: task,
                            rez: []
                        });
                    });

                    if (data.notes) {
                        notes = data.notes;
                    } else {
                        notes = [];
                    }


                    if (data.imageList) {
                        imageList = data.imageList;
                    } else {
                        imageList = [];
                        for (var i = 0; i < imagesCount; i++) {
                            imageList.push("data/rez-" + $window.localStorage.accessCode + "/img_" + (i + 1));
                        }
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
                    $http.post('/data/new', {
                        accessCode: $window.localStorage.accessCode,
                        data: {
                            values: items,
                            imgCount: imagesCount,
                            imageCursor: imageCursor,
                            imageList: imageList,
                            notes: notes,
                            addedCodes: addedCodes,
                            addedColors: addedColors,
                            taskNamesList: taskNamesList
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
        GetJSON: function() {
            var jItems = items.filter(function(item) {
                return item.colorUrl || item.colorRGB;
            });
            return JSON.stringify({
                values: jItems,
                notes: notes,
                addedCodes: addedCodes,
                addedColors: addedColors,
                taskNamesList: taskNamesList
            });
        }
    };
    this.FetchData = function() {
        return Server.FetchData();
    };
    this.UpdateByLast = function() {
        return Server.UpdateByLast();
    };
    this.GetJSON = function() {
        return Server.GetJSON();
    };

    this.SetCursor = function(val) {
        imageCursor = val;
    };
    this.Images = {
        GetList: function() {
            return imageList;
        },
        GetCursor: function() {
            return imageCursor;
        }
    };

    var Tasks = {
        GetTask: function(taskName) {
            var tasks = taskList.filter(function(task) {
                return task.name.val == taskName.val;
            });
            if (tasks.length == 0) {
                return null;
            }
            return tasks[0];
        },
        IsDone: function(taskName, code) {
            var task = Tasks.GetTask(taskName);
            if (!task) {
                return false;
            }
            return task.rez.filter(function(codeRez) {
               return codeRez.code == code;
            }).length > 0;
        },
        Complete: function(taskName, code, solution) {
            var task = Tasks.GetTask(taskName);
            if (!task) {
                return;
            }
            var prevSolution = task.rez.filter(function(codeRez) {
                    return codeRez.code == code;
                });
            if (prevSolution.length == 0) {
                task.rez.push({
                    code: code,
                    solution: solution
                });
            } else {
                prevSolution.solution = solution;
            }
        },
        RemoveAnswer: function(taskName, code) {
            var task = Tasks.GetTask(taskName);
            if (!task) {
                return;
            }
            task.rez = task.rez.filter(function(codeRez) {
                return codeRez.code != code;
            });
        },
        RemoveAnswerColorTask: function(code, colorCode) {
            var itemsByCode = items.filter(function(item) {
                return (item.code == code) && (item.colorCode == colorCode);
            });
            if (itemsByCode.length == 0) {
                return;
            }
            var itemByCode = itemsByCode[0];

            if (itemByCode.colorUrl) {
                delete itemByCode.colorUrl;
            }
            if (itemByCode.colorRGB) {
                delete itemByCode.colorRGB;
            }
        }
    };
    this.Tasks = {
        Get: function(code) {
            var names = taskNamesList.filter(function(taskName) {
                return !Tasks.IsDone(taskName, code);
            });
            if (names.length == 0) {
                return null;
            }
            return names[0];
        },
        Solve: function(taskName, code, solution) {
            Tasks.Complete(taskName, code, solution);
        },
        ColorTask: function(code) {
            var itemsByCode = items.filter(function(item) {
                return item.code == code
            }).filter(function(item) {
                return !item.colorUrl && !item.colorRGB
            });

            if (itemsByCode.length == 0) {
                return null;
            }
            return itemsByCode[0];
        },
        SolveColorTask: function(code, colorCode, answer) {
            var itemsByCode = items.filter(function(item) {
                return (item.code == code) && (item.colorCode == colorCode);
            });
            if (itemsByCode.length == 0) {
                return;
            }
            var itemByCode = itemsByCode[0];

            if (itemByCode.colorUrl) {
                delete itemByCode.colorUrl;
            }
            if (itemByCode.colorRGB) {
                delete itemByCode.colorRGB;
            }

            if (answer.type == 0) {
                itemByCode.colorUrl = answer.val;
            } else {
                itemByCode.colorRGB = answer.val;
            }
        }
    };

    this.Code = {
        Exists: function(code) {
            return (items.filter(
                    function(item) {
                        return item.code == code;
                    }
                ).length > 0) ||
                (addedCodes.filter(function(addedCode) {
                    return addedCode == code
                }).length > 0);
        },
        New: function(code) {
            addedCodes.push(code);
        }
    };

    var AddedColors = {
        Add: function(code, colorCode, colorDesc, answer) {
            var obj = {
                code: code,
                colorCode: colorCode,
                colorDesc: colorDesc
            };
            if (answer.type == 0) {
                obj.colorUrl = answer.val;
            } else {
                obj.colorRGB = answer.val;
            }
            addedColors.push(obj);
        },
        Remove: function(code, colorCode) {
            addedColors = addedColors.filter(
                function(addedColor) {
                    return !((addedColor.code == code) && (addedColor.colorCode == colorCode));
                }
            );
        }
    };
    this.AddedColors = AddedColors;

    var Notes = {
        Get: function(code) {
            var note = notes.filter(function(note) {
                return note.code == code;
            });
            if (note.length == 0) {
                note = {
                    code: code,
                    val: ''
                };
                notes.push(note);
                return note.val;
            }
            return note[0].val;
        },
        Set: function(code, val) {
            var note = notes.filter(function(note) {
                return note.code == code
            });
            if (note.length == 0) {
                note = {
                    code: code,
                    val: val
                };
                notes.push(note);
                return;
            }
            note[0].val = val;
        }
    };
    this.Notes = Notes;

    this.GetRGBForColorCode = function(colorCode) {
        var ans = '#000000';
        items.forEach(function(item) {
            if (item.colorCode == colorCode) {
                if (item.colorRGB) {
                    ans = item.colorRGB;
                }
            }
        });
        addedColors.forEach(function(item) {
            if (item.colorCode == colorCode) {
                if (item.colorRGB) {
                    ans = item.colorRGB;
                }
            }
        });
        return ans;
    };


    this.Info = {
        Get: function(code) {
            var obj = {
                props: [],
                imgs: []
            };
            taskList.forEach(function(task) {
                var results = task.rez.filter(function(rez) {
                        return rez.code == code
                    });
                if (results.length > 0) {
                    obj.props.push({
                        name: task.name,
                        ans: results[0].solution,
                        remove: Tasks.RemoveAnswer
                    });
                }
            });
            items.filter(function(item) {
                return item.code == code
            }).forEach(function(item) {
                if (item.colorUrl) {
                    obj.imgs.push({
                        type: 0,
                        colorUrl: item.colorUrl,
                        colorCode: item.colorCode,
                        colorDesc: item.colorDesc,
                        remove: Tasks.RemoveAnswerColorTask
                    });
                } else
                if (item.colorRGB) {
                    obj.imgs.push({
                        type: 1,
                        colorRGB: item.colorRGB,
                        colorCode: item.colorCode,
                        colorDesc: item.colorDesc,
                        remove: Tasks.RemoveAnswerColorTask
                    });
                }
            });

            addedColors.filter(function(color) {
               return color.code == code
            }).forEach(function(item) {
                if (item.colorUrl) {
                    obj.imgs.push({
                        type: 0,
                        colorUrl: item.colorUrl,
                        colorCode: item.colorCode,
                        colorDesc: item.colorDesc,
                        remove: AddedColors.Remove
                    });
                } else
                if (item.colorRGB) {
                    obj.imgs.push({
                        type: 1,
                        colorRGB: item.colorRGB,
                        colorCode: item.colorCode,
                        colorDesc: item.colorDesc,
                        remove: AddedColors.Remove
                    });
                }
            });

            obj.notes = Notes.Get(code);

            return obj;
        }
    };
});