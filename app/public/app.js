var module = angular.module('indexApp', ['ui.router', 'dataModel', 'collectionsModel', 'ngDialog']);

module.config(function($urlRouterProvider) {
    $urlRouterProvider.otherwise("/home");
});

window.onbeforeunload = function (e) {
    e = e || window.event;
    return 'Данные сохранены?';
};