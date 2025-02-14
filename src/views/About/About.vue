<template>
  <div class="about">
    <h2>关于我们</h2>
    <div class="content">
      <section class="mission">
        <h3>我们的使命</h3>
        <p>致力于为用户提供及时、准确、全面的新闻资讯服务，打造一个高质量的新闻资讯平台。</p>
      </section>

      <section class="intro">
        <h3>公司简介</h3>
        <p>新闻资讯网创建于2024年，是一家专注于新闻资讯服务的互联网平台。我们拥有专业的编辑团队，致力于为用户提供最新、最可靠的新闻资讯。</p>
      </section>

      <section class="values">
        <h3>核心价值观</h3>
        <ul>
          <li>真实性 - 确保新闻报道的真实性和可靠性</li>
          <li>及时性 - 第一时间传递重要新闻资讯</li>
          <li>客观性 - 保持新闻报道的客观公正</li>
          <li>责任感 - 践行新闻工作者的社会责任</li>
        </ul>
      </section>

      <section class="contact">
        <h3>联系我们</h3>
        <p>邮箱：contact@newssite.com</p>
        <p>电话：400-888-8888</p>
        <p>地址：北京市朝阳区新闻大厦</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.about {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  color: #333;
  text-align: center;
  margin-bottom: 30px;
}

.content {
  margin-top: 20px;
  padding: 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

section {
  margin-bottom: 40px;
}

h3 {
  color: #2c3e50;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #eee;
}

p {
  line-height: 1.6;
  color: #666;
}

ul {
  list-style-type: none;
  padding-left: 0;
}

li {
  margin-bottom: 10px;
  padding-left: 20px;
  position: relative;
  color: #666;
}

li:before {
  content: "•";
  color: #42b983;
  position: absolute;
  left: 0;
}

.contact p {
  margin: 5px 0;
}
</style>