from django.db import models


class HistoryTime(models.Model):
    order = models.PositiveIntegerField(unique=True, blank=True, null=True)
    year = models.CharField(max_length=50, null=True, blank=True, unique=True)
    word_of_year = models.CharField(max_length=50, null=True, blank=True, unique=True)


class HermToHistory(models.Model):
    title = models.CharField(max_length=50, default="")
    text = models.TextField()

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        return cls.objects.get_or_create(pk=1, defaults={"title": "", "text": ""})[0]


class ContentOrder(models.Model):
    content = models.CharField(max_length=50, null=True, blank=True)
    order = models.PositiveIntegerField(unique=True, blank=True, null=True)
    html_name = models.SlugField(unique=True)

    def __str__(self):
        return f"{self.order} - {self.content}"


class HermRandVerse(models.Model):
    text = models.TextField(default="")
    html_name = models.SlugField(blank=True, null=True, unique=True)

    def __str__(self):
        return f"{self.text[: 30]} - {self.html_name}"


class Reclamation(models.Model):
    text = models.CharField(max_length=30, default="")
    html_name = models.SlugField(blank=True, null=True, unique=True)

    def __str__(self):
        return f"{self.text[: 30]} - {self.html_name}"


class AnswerToReclamation(models.Model):
    text = models.TextField(default="")
    reclamation = models.ForeignKey(
        "Reclamation", on_delete=models.PROTECT, null=True, blank=True
    )
    repeat = models.PositiveIntegerField(default=100)

    def __str__(self):
        return f"{self.text[: 30]}"


class RawVerse(models.Model):
    html_name = models.SlugField(unique=True)
    title = models.TextField(null=True, blank=True)
    order = models.PositiveSmallIntegerField(blank=True, null=True, unique=True)
    text = models.TextField(max_length=50000, null=True)
    date_of_writing = models.DateField(blank=True, null=True)

    def __str__(self):
        return f"{self.pk}- {self.html_name} {self.title}"

    class Meta:
        managed = True
        db_table = "raw_verses"


class Hermeneutics(models.Model):
    raw_verses = models.ForeignKey(
        RawVerse, on_delete=models.SET_NULL, null=True, blank=True
    )
    html_name = models.SlugField(null=True, blank=True, unique=True)
    title = models.CharField(max_length=255, null=True, blank=True)
    text = models.TextField(max_length=65535)
    date_of_writing = models.DateField(blank=True, null=True)

    def __str__(self):
        return self.title

    class Meta:
        managed = True
        db_table = "hermeneutics"


class Audio(models.Model):
    raw_verses = models.ForeignKey(
        RawVerse, on_delete=models.SET_NULL, null=True, blank=True
    )
    html_name = models.SlugField(null=True, blank=True, unique=True)
    title = models.CharField(max_length=255, null=True, blank=True)
    audio = models.FileField(upload_to="", null=True, blank=True)
    date_of_writing = models.DateField(blank=True, null=True)

    def __str__(self):
        return self.title or f"Audio #{self.pk}"

    class Meta:
        managed = True
        db_table = "audio"


class EuPro(models.Model):
    html_name = models.SlugField(null=True, blank=True, unique=True)
    title = models.CharField(max_length=50, null=True, blank=True, unique=True)
    text = models.TextField(default="")
    date_of_writing = models.DateField(blank=True, null=True)

    def __str__(self):
        return str(self.pk) + ". " + self.title

    class Meta:
        managed = True
        db_table = "eu_pro"
