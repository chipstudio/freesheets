// Document helper functions
window.doc = {}

doc.loaded = function (func) {
    setTimeout(function () {
        if (document.readyState == "complete" || document.readyState == "loaded") {
            func()
        } else {
            window.addEventListener('DOMContentLoaded', function() {
                func()
            })
        }
    }, 500)
}

doc.get_id = function (id) {
	return document.getElementById(id)
}

doc.query = function (selector) {
    return document.querySelector(selector)
}

doc.query_all = function (selector) {
    return document.querySelectorAll(selector)
}

doc.get_class = function (_class) {
    return document.getElementsByClassName(_class)
}

doc.each_class = function (_class, func) {
    var class_els = doc.get_class(_class)
    for (var c=0; c<class_els.length; c++) {
        func(class_els[c])
    }
}

doc.clear_class_attr = function (className, attribute) {
    doc.each_class(className, function(same_class) {
        same_class.removeAttribute(attribute) 
    })
}


doc.capitalize = function (string) {
    var split_string = string.split(" ")
    for(var w=0; w<split_string.length; w++) {
        var word = split_string[w]
        split_string[w] = word[0].toUpperCase() + word.slice(1, word.length)
    }

    return split_string.join(" ")
}


doc.sort_alpha_numeric = function (array, key) {
    // sorts 0, 1a, 2, 2b, 3
    // takes object key or array index
    return array.sort(function(_a, _b){
        var a = _a[key]
        var b = _b[key]

        var reA = /[^a-zA-Z]/g;
        var reN = /[^0-9]/g;

        var aA = a.replace(reA, "");
        var bA = b.replace(reA, "");

        if (aA === bA) {
            var aN = parseInt(a.replace(reN, ""), 10);
            var bN = parseInt(b.replace(reN, ""), 10);
            return aN === bN ? 0 : aN > bN ? 1 : -1;
        } else {
            return aA > bA ? 1 : -1;
        }
    })
}


doc.render = function (template, replacements) {
	if (typeof template == "string") {
		template = doc.get_id(template)
	}

	if (template == null) {
		return
	}
    
    template = template.cloneNode(true)
    var templateHTML = template.innerHTML
    var templateVariables = templateHTML.match(/\{\{[a-zA-Z0-9_]+\}\}/g)

    if (templateVariables != null) {
        for (var t=0; t<templateVariables.length; t++) {
        	var templateVariable = templateVariables[t]
            var variableName = templateVariable.slice(2, templateVariable.length - 2)
            var variableValue = replacements[variableName]
            if (typeof variableValue === "undefined") {
                variableValue = "" }

            if (replacements.hasOwnProperty(variableName)) {
                templateHTML = templateHTML.replace(new RegExp(templateVariable, "g"), variableValue)
            } else {
                templateHTML = templateHTML.replace(new RegExp(templateVariable, "g"), "")
            }
        }
    }

    template.innerHTML = templateHTML
    var templateChildren = template.content.children
    
    if(templateChildren.length == 1) {
        return templateChildren[0]
    } else {
        return templateChildren
    }

	return template
}


doc.create_el = function(elName, setters) {
    if (setters === undefined) {
        var setters = {} }
    var _el = document.createElement(elName); 
    var setternames = Object.keys(setters); 
    for(var i=0; i<setternames.length; i++) {
        var setter_name = setternames[i]
        var value = setters[setter_name]
        if (setter_name == "class") {
            console.error("use 'className' instead of 'class'")
        } else if (setter_name == "innerHTML") {
            _el.innerHTML = value
        } else if (setter_name == "children") {
            for(var c=0; c<setters.children.length; c++) {
                _el.appendChild(setters.children[c])
            }
        } else if (setter_name == "className") {
            _el.className = value
        } else {
            _el.setAttribute(setter_name, value)
        } 
    } 
    return _el
}


function submit_form (event) {
    // works in tandem with doc.render_form
    event.preventDefault()
    event.stopPropagation()

    var form = event.currentTarget
    var editing = (form.getAttribute("editing") == "true")
    var form_data = doc.serialize(form)
    var model_name = form.getAttribute("model-name")

    var form_errors = data.validate_model(model_name, form_data)

    if (form_errors.length == 0) {
        if (editing == true) {
            data.update_model(model_name, form_data.id, form_data).then(function(updated_model) {
                console.log(updated_model)
            }).catch(function (error) {
                console.log(error)
            })
        } else {
            data.create_model(model_name, form_data).then(function(model_id){
                console.log(model_id)
            }).catch(function(error) {
                console.log(error)
            })
        }
    } else {
        console.log(form_errors)
    }
}


doc.render_form = function (model_name, prefills, hidden_fields, field_order) {
    if (window.hasOwnProperty(model_name) == false) {
        console.log("Define a model name")
        return }

    var model = window[model_name]
    if (prefills == null) {
        prefills = {} }

    Object.keys(prefills).forEach(function(prefill) {
        var prefill_value = prefills[prefill]
        if (prefill_value == null || prefill_value == "") {
            delete prefills[prefill]
        }
    })

    if (hidden_fields == null) {
        hidden_fields = [] }

    if (field_order == null) {
        field_order = Object.keys(model)}

    var editing = prefills.hasOwnProperty('id')

    var form = doc.create_el("form", {
        "model-name": model_name,
        "editing": editing,
        "onsubmit": "submit_form(event)" })
 
    field_order.forEach(function(field_name){
        var input_obj = {name: field_name}
        if (model[field_name] instanceof Requirement) {
            var constructor = model[field_name].field
            input_obj.required = ""
        } else {
            var constructor = model[field_name]
        }

        var constructor_name = constructor.name
        if (prefills.hasOwnProperty(field_name) == true) {
            var prefilled_value = prefills[field_name]

            if (Array.isArray(constructor) == true) {
                var cast_value = prefilled_value
            } else {
                var cast_value = constructor(prefilled_value)    
            }
        } else {
            var cast_value = ""
        }

        if (hidden_fields.indexOf(field_name) > -1) {
            input_obj.type = "hidden"
            input_obj.value = cast_value
            var form_field = doc.create_el("input", input_obj)
        } else if (Array.isArray(constructor) == true) {
            var form_options = []
            constructor.forEach(function (option) {
                var option_obj = {
                    innerHTML: option,
                    value: option }
                if (option == cast_value) {
                    option_obj.selected = "" }
                form_options.push(doc.create_el("option", option_obj))
            })

            input_obj.children = form_options
            input_obj.className = "custom-select"
            var form_field = doc.create_el("select", input_obj)
        } else {
            input_obj.value = cast_value
            
            if (constructor_name == "Date") {
                input_obj.type = "date"
            } else if (constructor_name == "Boolean") {
                input_obj.type = 'checkbox'
            } else if (constructor_name == "Number") { 
                input_obj.type = "number"
            } else {
                input_obj.type = 'text'
            }

            var form_field = doc.create_el("input", input_obj)
        }

        if (hidden_fields.indexOf(field_name) == -1) {
            var label = doc.create_el("label", {
                innerHTML: field_name })

            form.appendChild(label)
        }

        form.appendChild(form_field)
    })

    var submit_button = "Add " + model_name
    if (editing == true) {
        submit_button = "Update " + model_name }

    form.appendChild(doc.create_el("input", {
        type: 'submit',
        value: submit_button }))

    if (editing == true) {
        var delete_button = doc.create_el("div", {
            className: "delete-model",
            innerHTML: "Delete this " + model_name, 
            onclick: "data.delete_model('" + model_name + "', '" + prefills.id + "'); doc.close_modal(this)"
        })
        form.appendChild(delete_button)
    }

    return form
}


doc.render_modal = function (page, modal_html) {
    page.setAttribute("show-modal", true)
    page.getElementsByClassName("modal-content")[0].innerHTML = modal_html
}


doc.close_modal = function (page_el) {
    var parent_page = page_el.closest(".appy-page")
    parent_page.removeAttribute("show-modal")
}


doc.create_model_modal = function (el, model_name, prefills, hidden_fields, field_order) {
    var parent_page = el.closest(".appy-page")
    var model_form = doc.render_form(model_name, prefills, hidden_fields, field_order)
    doc.render_modal(parent_page, model_form.outerHTML)
}

doc.serialize = function (form) {
    var form_obj = {}
    var tags_to_serialize = ['input', 'select']
    for (var t=0; t<tags_to_serialize.length; t++) {
        var form_tags = form.querySelectorAll(tags_to_serialize[t])
        for (var f=0; f<form_tags.length; f++) {
            var field_type = form_tags[f].getAttribute("type")
            if (field_type == "checkbox") {
                form_obj[form_tags[f].name] = form_tags[f].checked
            } else if (form_tags[f].value != "" && field_type != "submit") {
                form_obj[form_tags[f].name] = form_tags[f].value
            }
        }
    }
    return form_obj
}


doc.parse_url = function (url) {
    if (url == undefined) {
        url = window.location.pathname }

    var split_url = []
    url.split("/").forEach(function(part) {
        if (part != "") { 
            split_url.push(part) } 
    })

    var url_object = []
    for (var o=0; o<split_url.length; o++) {
        var page_url = split_url[o]
        var split_page_url = page_url.split("~")
        var page_obj = [split_page_url[0]]
        if (split_page_url.length > 1) {
            options = split_page_url[1]
            options.split("&").forEach(function(option) {
                var split_option = option.split("=")
                var key = split_option[0]
                var value = split_option[1]
                if (key != "") {
                    page_obj.push([key, value])     
                }
            })
        }
        url_object.push(page_obj)
    }

    return url_object
}


doc.construct_url = function (url_object) {
    var url = ""
    url_object.forEach(function(page){
        url = url + "/" + page[0] + "~"
        if (page.length > 1) {
            var options = page.slice(1, page.length)
            options.forEach(function(option, index){
                url = url + option[0] + "=" + option[1] + "&"
            })
        }

        if (url[url.length - 1] == "&") {
            url = url.slice(0, url.length - 1)
        }
    })

    if (url[url.length - 1] == "~") {
        url = url.slice(0, url.length - 1)
    }

    return url
}
