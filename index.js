function bindEvent() {
    var page = 1,
        size = 15;
    var menuList = document.getElementsByClassName('menu')[0];
    menuList.onclick = function (e) {
        // console.log(e.target.nodeName)
        if (e.target.nodeName == 'DD') {
            // for (var i = 0; i < this.children.length; i++) {
            //     this.children[i].classList.remove('active');
            // }
            var etarSib = getSiblings(e.target);
            etarSib.forEach(function (elem, index) {
                elem.classList.remove('active');
            })

            e.target.classList.add('active');
            var id = e.target.getAttribute('data-id');

            var showContent = document.getElementById(id);
            var sContSib = getSiblings(showContent);
            sContSib.forEach(function (elem, index) {
                elem.style.display = 'none';
            })
            showContent.style.display = 'block';
        }
    }

    var submit = document.getElementById('student-add-submit');
    submit.onclick = function (e) {

        var form = document.getElementById('student-add-form');
        var data = getFormData(form);
        console.log(data)
        if (data) {
            transferData('/api/student/addStudent', data, function (result) {
                window.alert(result.msg);

                var form = document.getElementById('student-add-form');
                form.reset();
                getTableData();
            })
        }
        e.preventDefault();
    }

    //获取兄弟结点
    function getSiblings(node) {
        var siblings = [];
        var children = node.parentElement.children;
        for (var i = 0; i < children.length; i++) {
            if (children[i] != node) {
                siblings.push(children[i]);
            }
        }
        return siblings;
    }

    // 获取表单数据
    function getFormData(form) {
        var name = form.name.value;
        var sex = form.sex.value;
        var number = form.number.value;
        var email = form.email.value;
        var birth = parseInt(form.birth.value);
        var phone = form.phone.value;
        var address = form.address.value;

        return {
            sNo: number,
            name: name,
            sex: sex,
            birth: birth,
            phone: phone,
            address: address,
            email: email
        }
    }

    // 利用savaData函数向后台传数据
    function transferData(url, data, success) {
        data.appkey = 'wuhao_1585575377773';
        var result = saveData('http://open.duyiedu.com' + url, data);
        if (result.status == 'success') {
            success(result);
        } else {
            window.alert(result.msg);
        }
    }

    //获取后台所有学生信息
    function getTableData() {
        transferData('/api/student/findByPage', {
            page: page,
            size: size
        }, function (result) {
            renderTable(result);
        })
    }

    //渲染学生列表
    function renderTable(result) {
        var str = '';
        var renderList = result.data.findByPage;
        console.log(renderList);
        renderList.forEach(function (elem, index) {
            str += `
            <tr>
                <td>${elem.sNo}</td>
                <td>${elem.name}</td>
                <td>${elem.sex}</td>
                <td>${elem.email}</td>
                <td>${elem.age}</td>
                <td>${elem.phone}</td>
                <td>${elem.address}</td>
                <td>
                    <button class="edit btn">编辑</button>
                    <button class="del btn">删除</button>
                </td>
            </tr>
        `
        })

        
        var tbody = document.getElementById('tbody');
        tbody.innerHTML = str;
    }
}

bindEvent();

/**
 * 向后端存储数据
 * @param {*} url 
 * @param {*} param 
 */
function saveData(url, param) {
    var result = null;
    var xhr = null;
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else {
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }
    if (typeof param == 'string') {
        xhr.open('GET', url + '?' + param, false);
    } else if (typeof param == 'object') {
        var str = "";
        for (var prop in param) {
            str += prop + '=' + param[prop] + '&';
        }
        xhr.open('GET', url + '?' + str, false);
    } else {
        xhr.open('GET', url + '?' + param.toString(), false);
    }
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                result = JSON.parse(xhr.responseText);
            }
        }
    }
    xhr.send();
    return result;
}