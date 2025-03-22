import request from "@/utils/request";

//查询单个新闻列表详情
export function getNewsDetails(id) {
    return request({
      url: "/news/types/" + id,
      method: "get"
    });
  }


//查询新闻详情列表
export function getNewsDetailsList(data) {
  return request({
    url: "/news/info/list",
    method: "get",
    params: data,
  });
}

//获取单个新闻详情信息
export function getNewsInfo(id) {
  return request({
    url: "/news/info/" + id,
    method: "get"
  });
}

//点赞功能
export function addLikeNews(data) {
  return request({
    url: "/appreciate/info/addAppreciateInfo",
    method: "post",
    params: data,
  });
}

//标记功能
export function addMarkNews(data) {
  return request({
    url: "/news/label/addNewsLabel",
    method: "post",
    params: data,
  });
}