---
layout: default
title: Blog
---

## Blog

{% if site.posts.size == 0 %}
No posts yet. Stay tuned!
{% else %}
<div class="post-card">
  <h2 class="post-title">
    <a href="{{ post.url }}">{{ post.title }}</a>
  </h2>
  <p class="post-date">{{ post.date | date: "%B %d, %Y" }}</p>
  {% if post.excerpt %}
    <p class="post-excerpt">{{ post.excerpt }}</p>
  {% endif %}
</div>
  {% endfor %}
</div>
{% endif %}
