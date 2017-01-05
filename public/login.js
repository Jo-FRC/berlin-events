
myApp.controller('loginPhase', function($scope, $http) {
    $scope.viewLogin = function(){
        delete $scope.linkUpload;
        delete $scope.signup;
        delete $scope.login;
        $scope.login = true;
        console.log($scope.username);

        $scope.submitSignUp = function(){
            var url = '/berlinevents/login';
            var username = $scope.username;
            var password = $scope.password;


            var data = {
                username : username,
                password : password
            };


            $http.get(url, data).then(function(result){
                $scope.loggedIn = true;
                console.log(result);
            });
        };
    };
    $scope.viewSignUp = function(){
        delete $scope.linkUpload;
        delete $scope.login;
        delete $scope.signup;
        $scope.signup = true;

        $scope.submitSignUp = function(){
            var url = '/berlinevents/signup';
            var username = $scope.username;
            var email = $scope.email;
            var password = $scope.password;

            var data = {
                username : username,
                email : email,
                password : password
            };


            $http.post(url, data).then(function(result){
                $scope.signedUp = true;
                console.log(result);
            });
        };
    };



});
