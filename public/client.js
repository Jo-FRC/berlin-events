var myApp = angular.module('myApp', ['ui.router', 'ngCookies'])

.service('LoggedInServ', function($http, $state, $cookies){
    var LoggedInService = this;
    var loggedIn = $cookies.get('isLoggedIn');
    this.submitLogin = function(username, password){
        var url = 'berlinevents/login';
        var userData = { username, password };
        var jsonData = JSON.stringify(userData);
        return $http.post(url, jsonData)
        .then(function(result){
            LoggedInService.username = result.data.username;
            console.log(LoggedInService);
            console.log(result.data.username);
            // console.log(loggedIn);
            // console.log(result.data);
            console.log('this is successful');
            $cookies.put('isLoggedIn', true);
            loggedIn = true;
            $cookies.put('username', LoggedInService.username);
            // $state.go('home');
        })
        .catch(function(err){
            console.log(err);
        });
    };
    this.checkIfLoggedIn = function(){
        return loggedIn;

    };
    this.logout = function(){
        loggedIn = false;
        $cookies.remove('isLoggedIn');
        delete LoggedInService.username;
    };
    this.registerUser = function(){
        loggedIn = true;
        $cookies.put('isLoggedIn', true);
    };
    this.getUsername = function(){
        return new Promise(function(resolve, reject){
            if (LoggedInService.username) {
                resolve(LoggedInService.username);
            } else {
                $http.get('/getUserinfo').then(function(result){
                    LoggedInService.username = result.data.username;
                    resolve(result.data.username);
                });
            }

        });

    };
})

.config(['$urlRouterProvider', '$stateProvider', function($urlRouterProvider, $stateProvider){
    $urlRouterProvider.otherwise('/berlinevents');
    $stateProvider
    .state('home', {
        url : '/berlinevents',
        templateUrl: '/home.html',
        controller: function($scope, $http, LoggedInServ, $cookies){
            var url = '/berlinevents';
            // var isLoggedIn = LoggedInServ.checkIfLoggedIn();
            $scope.isLoggedIn = LoggedInServ.checkIfLoggedIn();
            console.log(LoggedInServ.checkIfLoggedIn());
            $scope.recentLinks = [];
            if ($scope.isLoggedIn) {
                LoggedInServ.getUsername().then(function(name){
                    $scope.username = name;
                });
            }

            $http.get(url).then(function(result){
                console.log(result.data.links);
                $scope.recentLinks = result.data.links;
                console.log($scope.recentLinks);
            });
        }
    })
    .state('login', {
        url : '/login?next&id',
        templateUrl: '/login.html',
        controller: function($scope, $http, $state, LoggedInServ, $cookies, $stateParams){
            console.log($stateParams);
            $scope.submitLogin = function(){
                LoggedInServ.submitLogin($scope.username, $scope.password)
                .then(function(){
                    $scope.loggedIn = true;
                    console.log($stateParams);
                    if ($stateParams.next){
                        $state.go($stateParams.next,{
                            id: $stateParams.id,
                            isLoggedIn: true
                        });
                    } else {
                        $state.go('home', {
                            isLoggedIn: true,

                        });
                    }

                });
            };
        }
    })
    .state('signup', {
        url : '/signup',
        templateUrl: '/signup.html',
        controller: function($scope, $http, $state, LoggedInServ, $cookies){

            $scope.submitSignUp = function(){
                var url = 'berlinevents/signup';
                var username = $scope.username;
                var email = $scope.email;
                var password = $scope.password;
                var data = {
                    username : username,
                    email : email,
                    password : password
                };
                var jsonData = JSON.stringify(data);
                $http.post(url, jsonData)
                .then(function(result){
                    LoggedInServ.registerUser();
                    $state.go('home',{
                        isLoggedIn: true
                    });
                    console.log(jsonData);
                })
                .catch(function(err){
                    console.log(err);
                });
            };
        }

    })
.state('logout', {
    url : '/logout',
    controller: function($scope, $http, $state, LoggedInServ, $cookies){
        LoggedInServ.logout();
        delete $scope.signedUp;
        delete $scope.loggedIn;
        delete $scope.linkUpload;
        $state.go('home');
    }
})
.state('addlink', {
    url : '/addlink',
    templateUrl: '/addlink.html',
    controller: function($scope, $http, $state, LoggedInServ, $cookies){
        $scope.isLoggedIn = LoggedInServ.checkIfLoggedIn();
        if ($scope.isLoggedIn) {
            $scope.recentLinks = [];
            $scope.link = {};
            var url = '/berlinevents';
            $http.get(url).then(function(result){
                console.log(result.data.links);

                $scope.recentLinks = result.data.links;
            });
            $scope.upload = function(){

                var url = '/berlinevents/link';
                var title = $scope.link.title;
                var link = $scope.link.url;
                console.log(link);
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
                    $state.go('home');
                });

            };

        } else {
            console.log('test');
            $state.go('login', {
                next: 'addlink'
            });
        }
    }
})
.state('comments', {
    url : '/comment/:id',
    templateUrl: '/comments.html',
    controller: function($scope, $http, $state, LoggedInServ, $cookies, $stateParams){
        $scope.isLoggedIn = LoggedInServ.checkIfLoggedIn();
        if ($scope.isLoggedIn) {
            LoggedInServ.getUsername().then(function(name){
                $scope.username = name;
            });
            $scope.recentComments = [];
            $scope.comment = {};
            var url = '/link/' + $stateParams.id;

            $http.get(url).then(function(result){
                console.log(result.data.comments);
                $scope.recentComments = result.data.comments;
            });
            $scope.addComment = function(){
                var url = '/link/' + $stateParams.id;
                var comment = $scope.comment;
                console.log(comment);
                $http.post(url, comment).then(function(result){
                    console.log(result);
                    $scope.recentComments.unshift(result.data);
                    delete $scope.comment.text;
                });
            };
        } else {
            $state.go('login', {
                next: 'comments',
                id: $stateParams.id
            });
        }
    }
});
}]);
