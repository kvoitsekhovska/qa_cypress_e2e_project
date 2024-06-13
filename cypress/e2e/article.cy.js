/// <reference types='cypress' />
/// <reference types='../support' />
import ArticlePageObject from '../support/pages/article.pageObject';
import HomePageObject from '../support/pages/home.pageObject';

const articlePage = new ArticlePageObject();
const homePage = new HomePageObject();

describe('Article', () => {
  let user;
  let article;
  let articleNew;

  before(() => {
    cy.task('db:clear');
    cy.task('generateUser').then((generateUser) => {
      user = generateUser;
      return cy.task('generateArticle').then((generateArticle) => {
        article = generateArticle;
      });
    });
    cy.task('generateArticleNew').then((generateArticleNew) => {
      articleNew = generateArticleNew;
    });
  });

  beforeEach(() => {
    cy.task('db:clear');
    cy.register(user.email, user.username, user.password);
  });

  it('should be created using New Article form', () => {
    homePage.visit(`/#/@${user.username}/`);
    homePage.assertHeaderContainUsername(user.username);
    articlePage.articleLinkClick();
    articlePage.articleTypeTitle(article.title);
    articlePage.articleTypeAbout(article.description);
    articlePage.articleTypeBody(article.body);
    articlePage.articleTypeTags(article.tag);
    articlePage.publishButtonClick();
  });

  it('should be edited using Edit button', () => {
    cy.login(user.email, user.password).then(() => {
      cy.createArticle(user.id,
        article.title,
        article.description,
        article.body).then((articles) => {
        const slug = articles.body.article.slug;
        cy.visit(`/#/articles/${slug}`);
        articlePage.clickEditButton();
        articlePage.editAllProperties(articleNew.title_new,
          articleNew.description_new,
          articleNew.body_new,
          articleNew.tag_new);
        articlePage.publishButtonClick();
        articlePage.assertAllChanges(articleNew.title_new, articleNew.body_new);
      });
    });
  });

  it('should be deleted using Delete button', () => {
    cy.login(user.email, user.password).then(() => {
      cy.createArticle(
        user.id,
        article.title,
        article.description,
        article.body).then((articles) => {
        const slug = articles.body.article.slug;
        cy.visit(`/#/articles/${slug}`);
        articlePage.clickDeleteButton();
      });
    });

    homePage.visit(`/#/@${user.username}/`);
    homePage.assertArticleDeletion();
  });
});
