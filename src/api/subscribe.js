import request from "@/utils/request";
import {getToken} from "@/utils/auth"

//添加订阅
export function addSubscribe(data) {
  return request({
    url: "/user/subscribe/addUserSubscribe",
    method: "post",
    headers: { Authorization: "Bearer " + getToken() },
    params:data,
  })
}

//修改
export function updateSubscribe(data) {
  return request({
    url: "/user/subscribe/updateUserSubscribe",
    method: "post",
    headers: { Authorization: "Bearer " + getToken() },
    params:data,
  })
}

//查询
export function getSubscribe(userId) {
  return request({
    url: "/user/subscribe/getUserSubscribe",
    method: "get",
    headers: { Authorization: "Bearer " + getToken() },
    params: { userId },
  })
}

//删除
export function deleteSubscribe(id) {
  return request({
    url: "/user/subscribe/deleteUserSubscribe",
    method: "post",
    headers: { Authorization: "Bearer " + getToken() },
    params: { id },
  })
}
