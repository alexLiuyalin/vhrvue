<template>
    <div>
        <el-form :rules="rules" ref="loginForm" v-loading="loading" element-loading-text="正在登录..."
            element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)" :model="loginForm"
            class="loginContainer">
            <h3 class="loginTitle">系统登录</h3>
            <el-form-item prop="username">
                <el-input size="normal" type="text" v-model="loginForm.username" auto-complete="off"
                    placeholder="请输入用户名"></el-input>
            </el-form-item>
            <el-form-item prop="password">
                <el-input size="normal" type="password" v-model="loginForm.password" auto-complete="off"
                    placeholder="请输入密码"></el-input>
            </el-form-item>
            <el-checkbox size="normal" class="loginRemember" v-model="checked">记录密码</el-checkbox>
            <GoCaptchaBtn class="go-captcha-btn" v-model="loginForm.captStatus" width="100%" height="60px"
                :image-base64="captBase64" :thumb-base64="captThumbBase64" @confirm="handleConfirm"
                @refresh="handleRequestCaptCode" />
            <el-button size="normal" type="primary" style="width: 100%;" @click="submitLogin">登录</el-button>
        </el-form>
    </div>
</template>

<script>
import GoCaptchaBtn from '../components/login/GoCaptchaBtn';
import Qs from 'qs';
import { Message } from 'element-ui';
import { SetCIDFromCookies, ClearCID, SetAccountFromCookies, GetAccountFromCookies } from '../utils/cookie'
import md5 from 'js-md5';
export default {
    name: "Login",
    components: {
        GoCaptchaBtn,
    },
    data() {
        return {
            loading: false,
            loginForm: {
                username: '',
                password: '',
                captStatus: 'default',
            },
            captBase64: '',
            captThumbBase64: '',
            captKey: '',
            checked: false,
            rules: {
                username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
                password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
                captKey: [{ required: true, message: '请人机验证', trigger: 'blur' }]
            }
        }
    },
    mounted() {
        console.log('组件已挂载到 DOM');
        let username = sessionStorage.getItem('username')
        if (username) {
            // GetAccountFromCookies(this.loginForm.username, this.loginForm.password);
            this.loginForm.username = sessionStorage.getItem('username')
            this.loginForm.password = sessionStorage.getItem('password')
            this.checked = true
        }else{
            this.checked = false
        }
    },

    methods: {
        handleRequestCaptCode() { // 获取验证码
            this.$refs.loginForm.validate((valid) => {
                if (valid) {
                    this.getRequest('/captcha').then(resp => {
                        if (resp) {
                            this.captBase64 = resp.b64
                            this.captThumbBase64 = resp.tb64
                            this.captKey = resp.cid
                        } else {
                            Message({
                                message: `获取人机验证数据失败`,
                                type: 'warning'
                            })
                        }
                    })
                }
            });
        },
        handleConfirm(dots) {//处理验证码校验请求
            if (!dots || dots.length <= 0) {
                // dots 数据为空或未定义时给出警告并提前返回
                Message({
                    message: `请进行人机验证再操作`,
                    type: 'warning'
                });
                return;
            }
            let dotArr = []
            dots.forEach(dot => {
                dotArr.push(dot.x, dot.y)
            })
            this.postRequest('/captcha', Qs.stringify({
                verify_value: dotArr.join(','),
                cid: this.captKey
            })).then((response) => {
                if (response.message === 'success') {
                    SetCIDFromCookies(this.captKey)
                    Message({
                        message: `人机验证成功`,
                        type: 'success'
                    });
                    this.loginForm.captStatus = 'success';
                    this.captAutoRefreshCount = 0;
                } else {
                    Message({
                        message: `人机验证失败`,
                        type: 'warning'
                    });
                    if (this.captAutoRefreshCount > 5) {
                        this.captAutoRefreshCount = 0;
                        this.loginForm.captStatus = 'over';
                        return;
                    }
                    this.handleRequestCaptCode()
                    this.captAutoRefreshCount += 1
                    this.loginForm.captStatus = 'error'
                }
            })
        },
        submitLogin() { // 登录
            if (this.loginForm.captStatus != 'success') { // 判断是否验证过
                Message({
                    message: `请进行人机验证再操作`,
                    type: 'warning'
                });
                ClearCID();
                return false;
            }
            this.$refs.loginForm.validate((valid) => {
                if (valid) {
                    this.loading = true;
                    this.postRequest('/login', Qs.stringify({
                        account: this.loginForm.username,
                        password: md5(this.loginForm.password)
                    })).then(resp => {
                        //判断复选框是否被勾选 勾选则调用配置cookie方法
                        if ((this.checked = true)) {
                            SetAccountFromCookies(this.loginForm.username, this.loginForm.password);
                        }
                        if (resp) {
                            this.$store.commit('INIT_CURRENTHR', resp);
                            window.sessionStorage.setItem("user", JSON.stringify(resp));
                            let path = this.$route.query.redirect;
                            this.$router.replace((path == '/' || path == undefined) ? '/home' : path);
                        } else {
                            ClearCID();
                            return false;
                        }
                    })
                } else {
                    return false;
                }
            });
        },
    }
}
</script>

<style>
.loginContainer {
    border-radius: 15px;
    background-clip: padding-box;
    margin: 180px auto;
    width: 350px;
    padding: 15px 35px 15px 35px;
    background: #fff;
    border: 1px solid #eaeaea;
    box-shadow: 0 0 25px #cac6c6;
}

.go-captcha-btn {
    width: 300px !important;
    margin: 0 auto !important;
}

.loginTitle {
    margin: 15px auto 20px auto;
    text-align: center;
    color: #505458;
}

.loginRemember {
    text-align: left;
    margin: 0px 0px 15px 0px;
}

.el-form-item__content {
    display: flex;
    align-items: center;
}
</style>
