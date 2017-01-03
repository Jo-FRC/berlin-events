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
        if (link.substring(0, 4) !== 'http') {
            link = 'http://' + link;
        }
        var recent =  $scope.recentLinks;
        console.log(recent);
        var matching = recent.some(function(linkToCompare){
            console.log(link);
            console.log(linkToCompare.link);
            return linkToCompare.link == link;
        });

        if (matching) {
            alert('This link already exists');
            delete $scope.linkUpload;
            return;
        }

        var data = {
            title : title,
            url : link
        };

        $http.post(url, data).then(function(result){
            $scope.success = true;
            $scope.recentLinks.unshift(result.data);
        });
    
        delete $scope.linkUpload;
    };
});
