
myApp.controller('loginPhase', function($scope, $http) {
    $scope.viewLogin = function(){
        delete $scope.linkUpload;
        delete $scope.signup;
        $scope.login = true;
    };
    $scope.viewSignUp = function(){
        delete $scope.linkUpload;
        delete $scope.login;
        $scope.signup = true;
    };
});
