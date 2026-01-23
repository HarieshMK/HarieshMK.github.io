---
layout: default
title: Blog
---

## Blog

{% if site.posts.size == 0 %}
No posts yet. Stay tuned!
{% else %}
<ul>
  {% for post in site.posts %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a> - <em>{{ post.date | date: "%B %d, %Y" }}</em>
    </li>
  {% endfor %}
</ul>
{% endif %}
