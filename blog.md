---
layout: default
title: Blog
---

## Blog

{% if site.posts.size == 0 %}
No posts yet. Stay tuned!
{% else %}
<div class="post-list">
  {% for post in site.posts %}
    <div class="post-card">
      <a href="{{ post.url }}"><h2>{{ post.title }}</h2></a>
      <p class="post-date">{{ post.date | date: "%B %d, %Y" }}</p>
      {% if post.excerpt %}<p>{{ post.excerpt }}</p>{% endif %}
    </div>
  {% endfor %}
</div>
{% endif %}
