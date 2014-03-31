//-- copyright
// OpenProject is a project management system.
// Copyright (C) 2012-2014 the OpenProject Foundation (OPF)
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 3.
//
// OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
// Copyright (C) 2006-2013 Jean-Philippe Lang
// Copyright (C) 2010-2013 the ChiliProject Team
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// See doc/COPYRIGHT.rdoc for more details.
//++

// TODO move to UI components
angular.module('openproject.workPackages.directives')

.directive('workPackageColumn', ['PathHelper', 'WorkPackagesHelper', 'UserService', function(PathHelper, WorkPackagesHelper, UserService){
  return {
    restrict: 'EA',
    replace: true,
    scope: {
      workPackage: '=',
      column: '=',
      displayType: '@'
    },
    templateUrl: '/templates/work_packages/work_package_column.html',
    link: function(scope, element, attributes) {
      scope.displayType = scope.displayType || 'text';

      // Set text to be displayed
      scope.$watch('workPackage', setColumnData, true);

      function setColumnData() {
        // retrieve column value from work package
        if (scope.column.custom_field) {
          var custom_field = scope.column.custom_field;

          scope.displayText = WorkPackagesHelper.getFormattedCustomValue(scope.workPackage, custom_field) || '';
        } else {
          // custom display types
          if (scope.column.name === 'done_ratio') scope.displayType = 'progress_bar';

          scope.displayText = WorkPackagesHelper.getFormattedColumnData(scope.workPackage, scope.column) || '';
        }

        if (scope.column.meta_data.data_type === 'user') loadUserName();

        // Example of how we can look to the provided meta data to format the column
        // This relies on the meta being sent from the server
        if (scope.column.meta_data.link.display) {
          scope.displayType = 'link';
          scope.url = getLinkFor(scope.column.meta_data.link);
        }
      }

      function loadUserName() {
        var userId = scope.displayText;

        if(userId) {
          scope.user = UserService.registerUserId(userId);

          scope.$watch('user.name', function(userName) {
            // triggered when user data is loaded
            // TODO replace watcher as soon as data is loaded via a promise chain
            scope.displayText = userName;
          });
        }
      }

      function getLinkFor(link_meta){
        if (link_meta.model_type === 'work_package') {
          return PathHelper.workPackagePath(scope.workPackage.id);
        } else if (scope.workPackage[scope.column.name]) {
          switch (link_meta.model_type) {
            case 'user':
              return PathHelper.userPath(scope.workPackage[scope.column.name].id);
            case 'version':
              return PathHelper.versionPath(scope.workPackage[scope.column.name].id);
            case 'project':
              return PathHelper.projectPath(scope.workPackage.project.identifier);
            default:
              return '';
          }

        }
      }

    }
  };
}]);
