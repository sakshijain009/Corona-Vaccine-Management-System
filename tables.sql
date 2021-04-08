CREATE TABLE Location
(
    pincode numeric(6) PRIMARY KEY,
    area varchar(30) NOT NULL,
    city varchar(20) NOT NULL,
    state varchar(20) NOT NULL
);
CREATE TABLE Inventory
(
    I_id int PRIMARY KEY AUTO_INCREMENT,
    I_name varchar(20) NOT NULL,
    I_contactno numeric(10),
    I_address numeric(6) NOT NULL,
    FOREIGN KEY (I_address) REFERENCES Location(pincode) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Vaccine
(
    V_name varchar(20) PRIMARY KEY,
    V_company varchar(20) NOT NULL,
    V_cost float NOT NULL
);

CREATE TABLE Hospital
(
    H_id int AUTO_INCREMENT PRIMARY KEY,
    H_name varchar(30) NOT NULL,
    H_pwd varchar(200),
    H_contactno numeric(10),
    H_type char(1) NOT NULL CHECK (H_type='G' OR H_type='P'),
    H_address numeric(6) NOT NULL,
    H_email varchar(30),
    H_vac varchar(20),
    FOREIGN KEY (H_address) REFERENCES Location(pincode) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (H_vac) REFERENCES Vaccine(V_name) ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE Supplies
(
    S_id int auto_increment primary key,
    S_hospital int,
    S_inventory int,
    S_quantity numeric,
    S_time timestamp,
    Foreign key (S_hospital) references hospital(h_id) on delete cascade on update cascade,
    Foreign key (S_inventory) references inventory(i_id) on delete cascade on update cascade
);
CREATE TABLE Person
(
    P_id int PRIMARY KEY AUTO_INCREMENT,
    P_name varchar(30) NOT NULL,
    P_Gender char(20) NOT NULL,
    P_DOB DATE NOT NULL,
    P_contactno numeric(10),
    P_address numeric(6),
    P_email varchar(30),
    FOREIGN KEY (P_address) REFERENCES Location(pincode) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE Doctor
(
    D_id int PRIMARY KEY,
    D_dept varchar(20) NOT NULL,
    FOREIGN KEY (D_id) REFERENCES Person(P_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Vaccinates
(
    P int,
    Hosp int,
    Date_first DATE,
    Date_second DATE,
    PRIMARY KEY (P, Hosp),
    FOREIGN KEY (P) REFERENCES Person(P_id)  ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Hosp) REFERENCES Hospital(H_id)  ON DELETE CASCADE ON UPDATE CASCADE
);


INSERT INTO Location VALUES(110005, "Anand Parbat", "Delhi", "Delhi");
INSERT INTO Location VALUES(110001, "Baroda House", "Delhi", "Delhi");
INSERT INTO Location VALUES(400037, "Antop Hill", "Mumbai", "Maharashtra");
INSERT INTO Location VALUES(400038, "Ballard Estate", "Mumbai", "Maharashtra");
INSERT INTO Location VALUES(303609, "Harsoli Jaipur", "Jaipur", "Rajasthan");
INSERT INTO Location VALUES(395009, "Adajan", "Surat", "Gujarat");

INSERT INTO Inventory VALUES(1, "Metas Inventory", 7789234, 400038);
INSERT INTO Inventory VALUES(2, "Anandibai Inventory", 8056379, 110001);
INSERT INTO Inventory VALUES(3, "Sanjeevani Inventory", 5882310, 303609);

INSERT INTO Vaccine VALUES("Covaxin", "Bharat Biotech", 3500);
INSERT INTO Vaccine VALUES("Covishield", "AstraZeneca", 3000);

INSERT INTO Person VALUES(1, "Himani", "Female", "2001-05-01", 7923017823, 395009, "himani@gmail.com");
INSERT INTO Person VALUES(2, "Akash", "Male", "1998-05-15", 9235178353, 400038, "akash@gmail.com");
INSERT INTO Person VALUES(3, "Sakshi", "Female", "2005-12-19", 9991202389, 110005, "sakshi@gmail.com");
INSERT INTO Person VALUES(4, "Ram Nivas", "Male", "1973-12-07", 8218903456, 110001, "nivasram@gmail.com");
INSERT INTO Person VALUES(5, "Aditya", "Male", "2000-01-01", 7923961209, 395009, "aditya@gmail.com");
