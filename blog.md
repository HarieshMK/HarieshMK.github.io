---
layout: default
title: Blog
---

## Blog

{% if site.posts.size == 0 %}
<p>No posts yet. Stay tuned!</p>
{% else %}
{% for post in site.posts %}
<div class="post-card">
  <h2 class="post-title">
    <a href="{{ post.url }}">{{ post.title }}</a>
  </h2>
  <p class="post-date">{{ post.date | date: "%B %d, %Y" }}</p>

  {% if post.excerpt %}
  {{ post.excerpt }}
  {% endif %}
</div>
{% endfor %}
{% endif %}
