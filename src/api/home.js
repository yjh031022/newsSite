import request from "@/utils/request";

//查询新闻类别列表
export function getNewsTypeList(data) {
    return request({
      url: "/news/types/list",
      method: "get",
      params: data,
    });
  }
  