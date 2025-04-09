import request from "@/utils/request";

//查询新闻类别列表
export function getNewsTypeList(data) {
    return request({
      url: "/news/types/list",
      method: "get",
      params: data,
    });
  }

  //热门栏目
  export function getHotColumn() {
    return request({
      url: "/column/info/hotColumn",
      method: "get",
    });
  }

  //获取热门栏目的top10新闻
  export function getHotNewsTOP10(data) {
    return request({
      url: "/news/info/getReadingNumTop10",
      method: "get",
      params: data,
    });
  }

  //获取今日要闻TOP10
  export function getTodayNewsTOP10(data) {
    return request({
      url: "/news/info/getAllHotNewsInfoTop10",
      method: "get",
      params: data,
    });
  }

  //搜输入框搜索功能
export function getSearchNews(keyWords) {
  return request({
    url: "/news/info/searchNewsInfo",
    method: "get",
    params: { keyWords },
  });
}

//每日推荐功能
export function getEveryDayNews(userId) {
  return request({
    url: "/user/behavior/userSell",
    method: "post",
    params: { userId }
  });
}

