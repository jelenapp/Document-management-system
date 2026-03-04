# Document-management-system
Kolaborativni fajl sistem za organizacije koji omogućava korisnicima da kreiraju, uređuju i upravljaju deljenim dokumentima i datotekama u stilu prezentacija u realnom vremenu. Inspirisan Google dokumentima, fokusira se na arhitekturu bekenda i upravljanje podacima, a ne na potpunu složenost uređivanja u realnom vremenu. Koristi MongoDB.

# O projektu
Rich text editor po ugledu na Google Docs. Postoji custom file system svakog korisnika. 

Korisnici mogu da dodaju nove direktorijume i fajlove. Fajl je rich text document (kao docx) u koji je moguce dodavati i slike. Korisnici mogu postavljati i komentare na fajl, i reakcije na odredjeni komentar.

Nakon registrovanja korisnika, neophodno je verifikovati email adresu.

Organizacije su specijalni folderi korisnika koji sluze za kolaboraciju.  
Organizacije je moguce testirati kroz Swagger. Nije realizovana kolaboracija izmedju razlicitih korisnika kroz UI.

Koristi se Atlas cloud mongo baza.

# Pokretanje
U root direktorijumu izvrsiti:

```docker compose up --build```

Server radi na portu 5000.

Swagger: **http://localhost:5000/docs/**

Client: **http://localhost:3000**
