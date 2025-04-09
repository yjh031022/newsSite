import request from "@/utils/request";
import {getToken} from "@/utils/auth";

export function login(data) {
  return request({
    url: "/user/info/login",
    method: "post",
    headers: { Authorization: "Bearer " + getToken() },
    params: data,
  });
}
