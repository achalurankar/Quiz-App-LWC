({
    doInit : function(component, event, helper) {
        $A.createComponent('c:app', {}, cmp => component.set("v.body", cmp))
    }
})