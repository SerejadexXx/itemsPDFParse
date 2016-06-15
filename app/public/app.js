var module = angular.module('indexApp', ['ui.router', 'dataModel']);

module.config(function($urlRouterProvider) {
    $urlRouterProvider.otherwise("/home");
});
