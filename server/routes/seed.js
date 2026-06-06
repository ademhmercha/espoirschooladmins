const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Group = require('../models/Group');
const Student = require('../models/Student');
const Session = require('../models/Session');
const Payment = require('../models/Payment');

const MONTHS = [
  'Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre',
];
const currentMonth = () => {
  const d = new Date();
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

// POST /api/seed         → seed si vide
// POST /api/seed?reset=1 → efface tout et re-seed
router.post('/', async (req, res) => {
  try {
    const alreadySeeded = await User.findOne({ role: 'admin' });
    if (alreadySeeded && req.query.reset !== '1') {
      return res.json({ ok: false, message: 'Déjà seedé. Ajoute ?reset=1 pour tout réinitialiser.' });
    }

    // ── Nettoyage ──────────────────────────────────────────────
    await Promise.all([
      User.deleteMany({}),
      Group.deleteMany({}),
      Student.deleteMany({}),
      Session.deleteMany({}),
      Payment.deleteMany({}),
    ]);

    const hash = (p) => bcrypt.hash(p, 10);

    // ── Utilisateurs ───────────────────────────────────────────
    const [admin, fatma, mohamed, amina, karim, sonia] = await User.insertMany([
      { name: 'Administrateur',    email: 'admin@espoir.tn',    password: await hash('admin123'),   role: 'admin',   phone: '71 000 000', subject: '' },
      { name: 'Fatma Ben Youssef', email: 'fatma@espoir.tn',    password: await hash('prof123'),    role: 'teacher', phone: '22 111 222', subject: 'Mathématiques' },
      { name: 'Mohamed Trabelsi',  email: 'mohamed@espoir.tn',  password: await hash('prof123'),    role: 'teacher', phone: '22 333 444', subject: 'Sciences Physiques' },
      { name: 'Amina Chaouachi',   email: 'amina@espoir.tn',    password: await hash('prof123'),    role: 'teacher', phone: '22 555 666', subject: 'Français' },
      { name: 'Karim Hadj',        email: 'karim@espoir.tn',    password: await hash('prof123'),    role: 'teacher', phone: '22 777 888', subject: 'Anglais' },
      { name: 'Sonia Maaloul',     email: 'sonia@espoir.tn',    password: await hash('prof123'),    role: 'teacher', phone: '22 999 000', subject: 'Arabe' },
    ]);

    // ── Élèves ─────────────────────────────────────────────────
    const students = await Student.insertMany([
      // Lycée
      { firstName: 'Ahmed',   lastName: 'Ben Salem',     level: 'Lycée',    parentPhone: '98 111 222' },
      { firstName: 'Nizar',   lastName: 'Hamdi',         level: 'Lycée',    parentPhone: '98 333 444' },
      { firstName: 'Fares',   lastName: 'Ben Romdhane',  level: 'Lycée',    parentPhone: '98 555 666' },
      { firstName: 'Mehdi',   lastName: 'Saidi',         level: 'Lycée',    parentPhone: '98 777 888' },
      // Collège
      { firstName: 'Mariem',  lastName: 'Karray',        level: 'Collège',  parentPhone: '97 111 222' },
      { firstName: 'Sara',    lastName: 'Tlili',         level: 'Collège',  parentPhone: '97 333 444' },
      { firstName: 'Noura',   lastName: 'Menzli',        level: 'Collège',  parentPhone: '97 555 666' },
      { firstName: 'Donia',   lastName: 'Ben Fredj',     level: 'Collège',  parentPhone: '97 777 888' },
      // Primaire
      { firstName: 'Youssef', lastName: 'Zaidi',         level: 'Primaire', parentPhone: '96 111 222' },
      { firstName: 'Adam',    lastName: 'Cherif',        level: 'Primaire', parentPhone: '96 333 444' },
      { firstName: 'Islem',   lastName: 'Abid',          level: 'Primaire', parentPhone: '96 555 666' },
      // Bac
      { firstName: 'Rim',     lastName: 'Bouaziz',       level: 'Bac',      parentPhone: '99 111 222' },
      { firstName: 'Lina',    lastName: 'Jabeur',        level: 'Bac',      parentPhone: '99 333 444' },
      { firstName: 'Yasmine', lastName: 'Dridi',         level: 'Bac',      parentPhone: '99 555 666' },
      { firstName: 'Aziz',    lastName: 'Gharbi',        level: 'Bac',      parentPhone: '99 777 888' },
    ]);

    const [ahmed, nizar, fares, mehdi, mariem, sara, noura, donia,
           youssef, adam, islem, rim, lina, yasmine, aziz] = students;

    // ── Groupes ────────────────────────────────────────────────
    const [grMathLycee, grPhysique, grFrancais, grAnglais, grArabe, grMathBac] = await Group.insertMany([
      {
        name: 'Maths Lycée A', teacher: fatma._id, subject: 'Mathématiques',
        level: 'Lycée', schedule: 'Lundi 15h30', monthlyPrice: 80,
        students: [ahmed._id, nizar._id, fares._id, mehdi._id],
      },
      {
        name: 'Physique Lycée', teacher: mohamed._id, subject: 'Sciences Physiques',
        level: 'Lycée', schedule: 'Mercredi 15h30', monthlyPrice: 80,
        students: [ahmed._id, nizar._id, fares._id, mehdi._id],
      },
      {
        name: 'Français Collège', teacher: amina._id, subject: 'Français',
        level: 'Collège', schedule: 'Samedi 10h00', monthlyPrice: 60,
        students: [mariem._id, sara._id, noura._id, donia._id],
      },
      {
        name: 'Anglais Bac', teacher: karim._id, subject: 'Anglais',
        level: 'Bac', schedule: 'Vendredi 14h00', monthlyPrice: 70,
        students: [rim._id, lina._id, yasmine._id, aziz._id],
      },
      {
        name: 'Arabe Primaire', teacher: sonia._id, subject: 'Arabe',
        level: 'Primaire', schedule: 'Samedi 14h00', monthlyPrice: 50,
        students: [youssef._id, adam._id, islem._id],
      },
      {
        name: 'Maths Bac', teacher: fatma._id, subject: 'Mathématiques',
        level: 'Bac', schedule: 'Mardi 17h00', monthlyPrice: 90,
        students: [rim._id, lina._id, yasmine._id, aziz._id],
      },
    ]);

    // Mettre à jour les groupes dans les élèves
    const groupUpdates = [
      { ids: [ahmed._id, nizar._id, fares._id, mehdi._id],   groups: [grMathLycee._id, grPhysique._id] },
      { ids: [mariem._id, sara._id, noura._id, donia._id],   groups: [grFrancais._id] },
      { ids: [youssef._id, adam._id, islem._id],              groups: [grArabe._id] },
      { ids: [rim._id, lina._id, yasmine._id, aziz._id],      groups: [grAnglais._id, grMathBac._id] },
    ];
    for (const { ids, groups } of groupUpdates) {
      await Student.updateMany({ _id: { $in: ids } }, { $set: { groups } });
    }

    // ── Séances ce mois ────────────────────────────────────────
    const now = new Date();
    const day = (d) => new Date(now.getFullYear(), now.getMonth(), d);

    await Session.insertMany([
      // Maths Lycée A — 2 séances
      {
        group: grMathLycee._id, date: day(3),
        attendances: [
          { student: ahmed._id, present: true }, { student: nizar._id, present: true },
          { student: fares._id, present: false }, { student: mehdi._id, present: true },
        ],
      },
      {
        group: grMathLycee._id, date: day(10),
        attendances: [
          { student: ahmed._id, present: true }, { student: nizar._id, present: false },
          { student: fares._id, present: true }, { student: mehdi._id, present: true },
        ],
      },
      // Physique Lycée — 2 séances
      {
        group: grPhysique._id, date: day(5),
        attendances: [
          { student: ahmed._id, present: true }, { student: nizar._id, present: true },
          { student: fares._id, present: true }, { student: mehdi._id, present: false },
        ],
      },
      {
        group: grPhysique._id, date: day(12),
        attendances: [
          { student: ahmed._id, present: false }, { student: nizar._id, present: true },
          { student: fares._id, present: true }, { student: mehdi._id, present: true },
        ],
      },
      // Français Collège — 1 séance
      {
        group: grFrancais._id, date: day(7),
        attendances: [
          { student: mariem._id, present: true }, { student: sara._id, present: true },
          { student: noura._id, present: true }, { student: donia._id, present: false },
        ],
      },
      // Anglais Bac — 1 séance
      {
        group: grAnglais._id, date: day(6),
        attendances: [
          { student: rim._id, present: true }, { student: lina._id, present: true },
          { student: yasmine._id, present: false }, { student: aziz._id, present: true },
        ],
      },
      // Arabe Primaire — 2 séances
      {
        group: grArabe._id, date: day(8),
        attendances: [
          { student: youssef._id, present: true },
          { student: adam._id, present: true },
          { student: islem._id, present: true },
        ],
      },
      {
        group: grArabe._id, date: day(15),
        attendances: [
          { student: youssef._id, present: false },
          { student: adam._id, present: true },
          { student: islem._id, present: true },
        ],
      },
    ]);

    // ── Paiements ce mois ──────────────────────────────────────
    const month = currentMonth();

    const paymentDocs = [];
    const groupsAll = [grMathLycee, grPhysique, grFrancais, grAnglais, grArabe, grMathBac];

    for (const group of groupsAll) {
      for (const studentId of group.students) {
        paymentDocs.push({ student: studentId, group: group._id, month, status: 'unpaid' });
      }
    }

    await Payment.insertMany(paymentDocs, { ordered: false }).catch(() => {});

    // Marquer quelques paiements comme payés
    const paidStudents = [ahmed._id, mariem._id, rim._id, lina._id, youssef._id];
    await Payment.updateMany(
      { student: { $in: paidStudents }, month },
      { $set: { status: 'paid', paidAt: new Date() } }
    );

    res.json({
      ok: true,
      message: '✅ Base seedée avec succès !',
      data: {
        admin: 'admin@espoir.tn / admin123',
        enseignants: [
          'fatma@espoir.tn / prof123',
          'mohamed@espoir.tn / prof123',
          'amina@espoir.tn / prof123',
          'karim@espoir.tn / prof123',
          'sonia@espoir.tn / prof123',
        ],
        eleves: students.length,
        groupes: groupsAll.length,
        mois: month,
      },
    });
  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
