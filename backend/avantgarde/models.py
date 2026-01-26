from django.db import models


class Reclamation(models.Model):
    text = models.TextField(default="")
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


class RawVerses(models.Model):
    html_name = models.CharField(max_length=50)
    title = models.TextField(null=True)
    text = models.TextField(max_length=50000, null=True)
    date_of_writing = models.DateField(blank=True, null=True)

    def __str__(self):
        return self.title

    class Meta:
        managed = True
        db_table = "raw_verses"


class Hermeneutics(models.Model):
    raw_verses = models.ForeignKey(
        RawVerses, on_delete=models.SET_NULL, null=True, blank=True
    )
    html_name = models.CharField(max_length=50, null=True, blank=True)
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
        RawVerses, on_delete=models.SET_NULL, null=True, blank=True
    )
    html_name = models.CharField(max_length=50, null=True, blank=True)
    title = models.CharField(max_length=255, null=True, blank=True)
    audio = models.FileField(upload_to="audio/", null=True, blank=True)
    date_of_writing = models.DateField(blank=True, null=True)

    def __str__(self):
        return self.title

    class Meta:
        managed = True
        db_table = "audio"


class EuPro(models.Model):
    html_name = models.CharField(max_length=50, null=True, blank=True)
    title = models.CharField(max_length=255, null=True, blank=True)
    text = models.TextField(max_length=65535)
    date_of_writing = models.DateField(blank=True, null=True)

    def __str__(self):
        return str(self.pk) + ". " + self.title

    class Meta:
        managed = True
        db_table = "eu_pro"
