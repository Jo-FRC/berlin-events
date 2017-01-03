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
        var title = $scope.link.title;
        var link = $scope.link.url;
        console.log(title);
        if (link.substring(0, 4) !== 'http') {
            console.log(link.substring(0, 4));
            link = 'http://' + link;
        }
        var data = {
            title : title,
            url : link
        };

        console.log(data);
        $http.post(url, data).then(function(result){
            $scope.success = true;
            $scope.recentLinks.unshift(result.data);
        });
    };
});
