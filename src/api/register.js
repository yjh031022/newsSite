import request from "@/utils/request";

//注册
export function register(data) {
  return request({
    url: "/user/info/register",
    method: "post",
    params: data,
  });
}
