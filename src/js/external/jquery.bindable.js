/**
 * jQuery.bindable
 * http://github.com/furf/jquery-bindable/
 *
 * Copyright 2010, Dave Furfero
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */
(function ($) {

  /**
   * Augments an object (or its prototype) with jQuery's event methods (bind,
   * one, trigger, unbind), providing it with custom event capability. An
   * optional second parameter can create convenient shortcut methods for 
   * binding to specific events.
   *
   * @example
   *
   * function Person (name, age) {
   *   this.name = name;
   *   this.age = age;
   * }
   * 
   * Person.prototype = {
   *   setName: function (name) {
   *     this.name = name;
   *     this.trigger('setName', [name]);
   *   },
   *   setAge: function (age) {
   *     this.age = age;
   *     this.trigger('setAge', [age]);
   *   },
   *   doSomething: function () {
   *     this.trigger('onDoSomething');
   *   },
   *   doSomethingElse: function () {
   *     this.trigger('onDoSomethingElse');
   *   }
   * };
   * 
   * // Augment Person.prototype with jQuery's four event methods and custom
   * // event subscriber methods onDoSomething and onDoSomethingElse.
   * $.bindable(Person, 'onDoSomething onDoSomethingElse');
   * 
   * // Create a generic custom event listener
   * function customEventListener (evt, val) {
   *   console.dir({
   *     event: evt,
   *     value: val,
   *     scope: this
   *   });
   * }
   * 
   * var dave = new Person('dave', 36),
   *     dahl = new Person('dahl', 36);
   * 
   * dave.bind('setName setAge', customEventListener);
   * dahl.bind('setName', customEventListener);
   * 
   * dave.setName('furf');
   * dahl.setName('baby');
   * dave.setAge(37);
   * 
   * dave.onDoSomething(customEventListener);
   * dave.onDoSomethingElse(customEventListener);
   * dave.doSomething();
   * dave.doSomethingElse();
   * 
   * @param {Object} obj object to augment with jQuery event methods
   * @param {String} types whitespace-delimited list of custom events
   * @returns {Object} augmented object
   */
  $.bindable = function (obj /*, types */) {

    /**
     * Allow use of prototype for shorthanding the augmentation of classes
     */
    obj = obj.prototype || obj;

    /**
     * Augment the object with jQuery's bind, one, and unbind event methods
     */ 
    $(['bind', 'one', 'unbind']).each(function (i, method) {
      obj[method] = function (type, data, fn, thisObject) {
        $(this)[method](type, data, fn, thisObject);
        return this;
      };
    });
    
    /**
     * The trigger event must be augmented separately because it requires a new
     * Event to prevent unexpected triggering of a method (and possibly
     * infinite recursion) when the event type matches the method name
     */ 
    obj.trigger = function (type, data) {
      var event = new $.Event(type);
      event.preventDefault();
      $(this).trigger(event, data);
      return this;
    };

    /**
     * Create convenience methods for event subscription which bind callbacks
     * to specified events
     */
    if (typeof arguments[1] === 'string') {
      $.each(arguments[1].split(/\s+/), function (i, type) {
        obj[type] = function (data, fn, thisObject) {
          return arguments.length ? this.bind(type, data, fn, thisObject) : this.trigger(type);
        };
      });
    }
    
    return obj;
  };

})(jQuery);