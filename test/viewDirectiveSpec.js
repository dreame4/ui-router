/*jshint browser: true, indent: 2 */
/*global describe: false, it: false, beforeEach: false, expect: false, resolvedValue: false, module: false, inject: false, angular: false */

'use strict';

describe('uiView', function () {
  var scope, $compile, elem;

  beforeEach(module('ui.state'));

  var aState = {
    template: 'a template'
  },
  aaState = {
    template: 'aa template'
  },
  bState = {
    views: {
      'bview': {
        template: 'bview'
      }
    }
  },
  cState = {
    views: {
      'cview1': {
        template: 'cview1 content'
      },
      'cview2': {
        template: 'cview2 content'
      }
    }
  },
  dState = {
    template: '<div ui-view="eview" class="eview"></div>',
  },
  eState = {
    views: {
      'eview': {
        template: 'eview content'
      }
    }
  },
  fState = {
    template: '<div ui-view="inner"><span ng-class="{ init: true }">{{content}}</span></div>'
  },
  gState = {
    views: {
      inner: {
        template: 'gview content'
      }
    }
  };

  beforeEach(module(function ($stateProvider) {
    $stateProvider
      .state('a', aState)
      .state('aa', aaState)
      .state('b', bState)
      .state('c', cState)
      .state('d', dState)
      .state('d.e', eState)
      .state('f', fState)
      .state('f.g', gState);
  }));

  beforeEach(inject(function ($rootScope, _$compile_) {
    scope = $rootScope.$new();
    $compile = _$compile_;
    elem = angular.element('<div>');
  }));

  describe('linking ui-directives', function () {
    it('anonymous ui-view should be replaced with the template of the current $state', inject(function ($state, $q) {
      $state.transitionTo(aState);
      $q.flush();

      elem.append($compile('<div ui-view></div>')(scope));
      expect(elem.text()).toBe(aState.template);
    }));

    it('ui-view should be updated after transition to other state', inject(function ($state, $q) {
      // aState
      $state.transitionTo(aState);
      $q.flush();

      elem.append($compile('<div ui-view></div>')(scope));
      expect(elem.text()).toBe(aState.template);

      // aaState
      $state.transitionTo(aaState);
      $q.flush();

      expect(elem.text()).toBe(aaState.template);
    }));

    it('named ui-view should be replaced with the template of the current $state', inject(function ($state, $q) {
      $state.transitionTo(bState);
      $q.flush();

      elem.append($compile('<div ui-view="bview"></div>')(scope));
      expect(elem.text()).toBe(bState.views.bview.template);
    }));

    it('should handle several not nested ui-views', inject(function ($state, $q) {
      $state.transitionTo(cState);
      $q.flush();

      elem.append($compile('<div ui-view="cview1" class="cview1"></div><div ui-view="cview2" class="cview2"></div>')(scope));
      expect(elem[0].querySelector('.cview1').innerText).toBe(cState.views.cview1.template);
      expect(elem[0].querySelector('.cview2').innerText).toBe(cState.views.cview2.template);
    }));

    it('should handle nested (two levels) ui-views', inject(function ($state, $q) {
      $state.transitionTo(eState);
      $q.flush();

      elem.append($compile('<div ui-view class="dview"></div>')(scope));
      expect(elem[0].querySelector('.dview').querySelector('.eview').innerText).toBe(eState.views.eview.template);
    }));
  });

  describe('initial view', function () {
    it('initial view should be compiled if the view is empty', inject(function ($state, $q) {
      $state.transitionTo(fState);
      $q.flush();

      elem.append($compile('<div ui-view class="main"></div>')(scope));
      scope.$apply('content = "great content"');
      expect(elem[0].querySelector('.init').innerText).toBe("great content");
    }));

    it('initial view should be put back after removal of the view', inject(function ($state, $q) {
      $state.transitionTo(gState);
      $q.flush();

      elem.append($compile('<div ui-view class="main"></div>')(scope));
      scope.$apply('content = "super content"');
      expect(elem.text()).toBe(gState.views.inner.template);

      // goes to the state that makes the inner view empty
      $state.transitionTo(fState);
      $q.flush();
      expect(elem[0].querySelector('.init').innerText).toBe("super content");
    }));
  });

});
