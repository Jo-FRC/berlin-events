var myApp = angular.module('myApp', []);

myApp.controller('linkUpdate', function($scope, $http) {
    var url = '/berlinevents';
    delete $scope.success;
    delete $scope.linkUpload;
    delete $scope.recentLinks;
    $scope.recentLinks = [];
    $scope.link = {};
    $http.get(url).then(function(result){
        console.log(result.data.links);

        $scope.recentLinks = result.data.links;
    });
    $scope.addLink = function(){
        $scope.linkUpload = true;
    };
    $scope.upload = function(){
        url = '/berlinevents/link';
        console.log($scope.link.title);
        var data = $scope.link;
        $http.post(url, data).then(function(result){
            $scope.success = true;
        });
    };
});
