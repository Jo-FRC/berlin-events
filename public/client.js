var myApp = angular.module('myApp', []);

myApp.controller('linkUpdate', function($scope, $http) {
    var url = '/berlinevents';
    delete $scope.success;
    delete $scope.linkUpload;
    delete $scope.recentLikns;
    $http.get(url).then(function(result){
        $scope.recentLikns = result.data.links;
    });
    $scope.addLink = function(){
        $scope.linkUpload = true;
    };
    $scope.upload = function(){
        url = '/berlinevents/link';
        var data = {
            image : {
                title: $scope.title,
                url : $scope.url
            }
        };
        $http.post(url, data).then(function(result){
            $scope.success = true;
        });
    };
});
