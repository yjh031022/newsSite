import request from "@/utils/request";
import {getToken} from "@/utils/auth";

//注册
export function register(data) {
  return request({
    url: "/user/info/register",
    method: "post",
    headers: { Authorization: "Bearer " + getToken() },
    params: data,
  });
}
