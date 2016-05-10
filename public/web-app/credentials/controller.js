angular.module('Credentials').controller("CredentialsCtrl", function ($scope, $mdDialog, userTypesService, userGroupsService, credentialsService, exportService, deleteUser, renewUser) {
    $scope.test = null;
    var requestForUserGroups = null;
    var initialized = false;
    $scope.exportFields = exportService.getFields();
    $scope.userTypes = userTypesService.getUserTypes();

    $scope.requestForCredentials = null;
    $scope.credentials = null;
    var credentials = [];
    // table items
    $scope.selectAllChecked = false;
    $scope.selectedItems = 0;
    // pagination
    $scope.itemsByPage = 10;
    $scope.currentPage = 1;

    $scope.table = {
        show: false,
        filter: "",
        order: 'userName'
    };

    $scope.removeFilter = function () {
        $scope.table.show = false;
        $scope.table.filter = '';
    };


    requestForUserGroups = userGroupsService.getUserGroups();
    requestForUserGroups.then(function (promise) {
        if (promise && promise.error) $scope.$broadcast("apiError", promise.error);
        else {
            $scope.userGroups = promise.userGroups;
            $scope.userGroupsLoaded = function () {
                return userGroupsService.isLoaded();
            };
            $scope.requestForCredentials = credentialsService.getCredentials();
            $scope.requestForCredentials.then(function (promise) {
                initialized = true;
                if (promise && promise.error) $scope.$broadcast("apiError", promise.error);
                else {
                    credentials = promise;
                    $scope.credentials = promise;
                    $scope.credentialsLoaded = function () {
                        return credentialsService.isLoaded()
                    };
                }
            });
        }
    });


    $scope.$watch("userGroups", function () {
        $scope.refresh();
    }, true);

    $scope.$watch("table.filter", function () {
        $scope.credentials = [];
        credentials.forEach(function (credential) {
            if ($scope.table.filter == ""
                || (credential.userName && credential.userName.indexOf($scope.table.filter) >= 0)
                || (credential.email && credential.email.indexOf($scope.table.filter) >= 0)
                || (credential.phone && credential.phone.indexOf($scope.table.filter) >= 0))
                $scope.credentials.push(credential);
        })

    });

    $scope.onlyOneSelected = function () {
        return $scope.selectedItems === 1;
    };
    $scope.moreThanOneSelected = function () {
        return $scope.selectedItems >= 1;
    };


    $scope.selectAll = function () {
        $scope.credentials.forEach(function (cred) {
            cred.selected = $scope.selectAllChecked;
        });
        if ($scope.selectAllChecked) $scope.selectedItems = $scope.credentials.length;
        else $scope.selectedItems = 0;
    };
    $scope.selectOne = function (cred, row) {
        if (row) cred.selected = !cred.selected;

        if (cred.selected) {
            $scope.selectedItems++;
        } else $scope.selectedItems--;
        $scope.selectAllChecked = $scope.selectedItems == $scope.credentials.length;
    };


    $scope.sendBySms = function () {
        var credentials = [];
        $scope.credentials.forEach(function (credential) {
            if (credential.selected) {
                credentials.push(credential);
            }
        });
        if (credentials.length == 1) {
            $mdDialog.show({
                controller: 'DialogSendBySmsController',
                templateUrl: 'modals/modalSendBySmsContent.html',
                locals: {
                    items: {
                        account: credentials[0]
                    }
                }
            });
        }
    };
    $scope.sendByEmail = function () {
        var credentials = [];
        $scope.credentials.forEach(function (credential) {
            if (credential.selected) {
                credentials.push(credential);
            }
        });
        if (credentials.length == 1) {
            $mdDialog.show({
                controller: 'DialogSendByEmailController',
                templateUrl: 'modals/modalSendByEmailContent.html',
                locals: {
                    items: {
                        account: credentials[0]
                    }
                }
            });
        }
    };
    $scope.refresh = function () {
        if (initialized) {
            $scope.requestForCredentials = credentialsService.getCredentials();
            $scope.requestForCredentials.then(function (promise) {
                if (promise && promise.error) $scope.$broadcast("apiError", promise.error);
                else {
                    credentials = promise;
                    $scope.credentials = promise;
                }
            });
        }
    };

    $scope.deleteCredentials = function (ev) {
        var ids = [];
        var userNames = [];
        $scope.credentials.forEach(function (credential) {
            if (credential.selected) {
                ids.push(credential.id);
                userNames.push(credential.userName);
            }
        });
        if (ids.length == 1) {
            var confirm = $mdDialog.confirm()
                .title('Are you sure?')
                .textContent('Do you want to delete the account ' + userNames[0] + '?')
                .ariaLabel('Confirmation')
                .targetEvent(ev)
                .ok('Please do it!')
                .cancel('Cancel');
            $mdDialog.show(confirm).then(function () {
                credentialsService.setIsLoaded(false);
                var deleteCredentials = deleteUser.deleteCredentials(ids);
                deleteCredentials.then(function (promise) {
                    credentialsService.setIsLoaded(true);
                    if (promise && promise.error) $scope.$broadcast("apiWarning", promise.error);
                    else $scope.refresh();
                });
            })

        } else if (ids.length > 1) {
            var confirm = $mdDialog.confirm()
                .title('Are you sure?')
                .textContent('Do you want to delete these ' + ids.length + ' accounts?')
                .ariaLabel('Confirmation')
                .targetEvent(ev)
                .ok('Please do it!')
                .cancel('Cancel');
            $mdDialog.show(confirm).then(function () {
                credentialsService.setIsLoaded(false);
                var deleteCredentials = deleteUser.deleteCredentials(ids);
                deleteCredentials.then(function (promise) {
                    credentialsService.setIsLoaded(true);
                    if (promise && promise.error) $scope.$broadcast("apiWarning", promise.error);
                    else $scope.refresh();
                });
            })
        }
    };
    $scope.renewCredentials = function (ev) {
        var ids = [];
        var userNames = [];
        $scope.credentials.forEach(function (credential) {
            if (credential.selected) {
                ids.push(credential.id);
                userNames.push(credential.userName);
            }
        });
        if (ids.length == 1) {
            var confirm = $mdDialog.confirm()
                .title('Are you sure?')
                .textContent('Do you want to renew the account ' + userNames[0] + '?')
                .ariaLabel('Confirmation')
                .targetEvent(ev)
                .ok('Please do it!')
                .cancel('Cancel');
            $mdDialog.show(confirm).then(function () {
                credentialsService.setIsLoaded(false);
                var deleteCredentials = renewUser.renewCredentials(ids);
                deleteCredentials.then(function (promise) {
                    credentialsService.setIsLoaded(true);
                    if (promise && promise.error) $scope.$broadcast("apiWarning", promise.error);
                    else $scope.refresh();
                });
            })

        } else if (ids.length > 1) {
            var confirm = $mdDialog.confirm()
                .title('Are you sure?')
                .textContent('Do you want to renew these ' + ids.length + ' accounts?')
                .ariaLabel('Confirmation')
                .targetEvent(ev)
                .ok('Please do it!')
                .cancel('Cancel');
            $mdDialog.show(confirm).then(function () {
                credentialsService.setIsLoaded(false);
                var deleteCredentials = renewUser.renewCredentials(ids);
                deleteCredentials.then(function (promise) {
                    credentialsService.setIsLoaded(true);
                    if (promise && promise.error) $scope.$broadcast("apiWarning", promise.error);
                    else $scope.refresh();
                });
            })
        }
    };
    $scope.export = function () {
        $mdDialog.show({
            templateUrl: 'views/modalExportContent.html',
            controller: 'DialogController',
            locals: {
                items: {
                    exportFields: $scope.exportFields
                }
            }
        });
    }
});