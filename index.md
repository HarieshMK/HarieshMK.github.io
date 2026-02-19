---
layout: default
title: Home
description: "The Unexciting Money Club: A practical guide to boring, disciplined wealth building. Real-life finance lessons from Hariesh Murugan for long-term thinkers. No hype, just boring but useful decisions."
---

## Real-life finance. No hype. No shortcuts.
...

Most personal finance content is either fake screenshots, overpromises, or straight-up noise. 

**This site is about:**
- Boring but real money decisions
- Long-term thinking
- Avoiding financial stupidity

---

### 📝 Latest from the Club

<div class="home-posts">
{% for post in site.posts limit:3 %}
  <a href="{{ post.url | relative_url }}" class="post-card-link">
    <div class="post-card home-card">
      <span class="post-title">{{ post.title }}</span>
      <span class="post-date">{{ post.date | date: "%B %d, %Y" }}</span>
      <div class="post-excerpt">
        {{ post.excerpt | strip_html | truncatewords: 15 }}
      </div>
    </div>
  </a>
{% endfor %}
</div>

<p style="text-align: center; margin-top: 30px;">
  <a href="{{ '/blog' | relative_url }}" style="font-weight: bold;">View All Articles →</a>
</p>
